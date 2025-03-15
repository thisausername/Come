package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"come-back/model"
	"come-back/repository"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

var (
	clients   = make(map[*Client]bool)
	clientsMu sync.Mutex
	broadcast = make(chan model.ChatMessage, 1000)

	batchSize     = 100
	messageBuffer = make([]model.ChatMessage, 0, batchSize)
	bufferMu      sync.Mutex
	batchInterval = 5 * time.Second

	redisClient     *redis.Client
	enableChatCache bool
)

type Client struct {
	conn   *websocket.Conn
	user   model.User
	mu     sync.Mutex
	closed bool
}

func (c *Client) WriteJSON(v any) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.closed {
		return nil
	}
	return c.conn.WriteJSON(v)
}

func (c *Client) WriteMessage(messageType int, data []byte) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.closed {
		return nil
	}
	return c.conn.WriteMessage(messageType, data)
}

func (c *Client) Close() {
	c.mu.Lock()
	if !c.closed {
		c.conn.Close()
		c.closed = true
	}
	c.mu.Unlock()
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

var once sync.Once

func initRedis() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("error loading environment variables!")
	}

	enableChatCache = os.Getenv("USE_CHAT_CACHE") == "true"
	if enableChatCache {
		log.Printf("enabling redis...")
		redisAddr := os.Getenv("REDIS_ADDR")
		redisClient = redis.NewClient(&redis.Options{
			Addr:     redisAddr,
			Password: "",
			DB:       0,
		})
		ctx := context.Background()
		_, err := redisClient.Ping(ctx).Result()
		if err != nil {
			log.Printf("Failed to connect to Redis: %v, disabling Redis", err)
			enableChatCache = false
			redisClient = nil
		} else {
			log.Println("Redis connected successfully")
		}
	} else {
		log.Printf("redis disabled")
	}
}

func init() {
	initRedis()
	once.Do(func() {
		go func() {
			for msg := range broadcast {
				clientsMu.Lock()
				for client := range clients {
					if client.closed {
						delete(clients, client)
						continue
					}
					err := client.WriteJSON(msg)
					if err != nil {
						log.Println("write error:", err)
						client.Close()
						delete(clients, client)
					}
				}
				clientsMu.Unlock()
			}
		}()

		go func() {
			ticker := time.NewTicker(batchInterval)
			defer ticker.Stop()
			for range ticker.C {
				bufferMu.Lock()
				if len(messageBuffer) == 0 {
					bufferMu.Unlock()
					continue
				}

				messages := make([]model.ChatMessage, len(messageBuffer))
				copy(messages, messageBuffer)
				messageBuffer = messageBuffer[:0]
				bufferMu.Unlock()

				if err := repository.CreateChatMessages(messages); err != nil {
					log.Printf("failed to batch save %d messages: %v", len(messages), err)
				} else {
					log.Printf("successfully saved %d messages", len(messages))
				}
			}
		}()
	})
}

func HandleChat(c *gin.Context) {
	var user model.User
	userID, exists := c.Get("user_id")
	if exists {
		var err error
		user, err = repository.QueryUser(userID.(uint))
		if err != nil {
			c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to get user"))
			return
		}
	} else {
		user = model.User{
			ID:       0,
			Username: fmt.Sprintf("anonymous_%d", rand.Intn(100000)),
		}
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("websocket upgrade failed:", err)
		return
	}
	log.Println("New WebSocket connection established for user:", user.Username)

	client := &Client{conn: conn, user: user, closed: false}
	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	joinMsg := model.ChatMessage{
		UserID:    user.ID,
		Username:  user.Username,
		Content:   fmt.Sprintf("%s come", user.Username),
		Timestamp: time.Now().Unix(),
		Type:      model.JoinType,
	}
	select {
	case broadcast <- joinMsg:
		if enableChatCache && redisClient != nil {
			ctx := c.Request.Context()
			msgJSON, _ := json.Marshal(joinMsg)
			redisClient.LPush(ctx, "chat_history", msgJSON)
			redisClient.LTrim(ctx, "chat_history", 0, 49)
		}
	default:
		log.Println("Broadcast channel full, dropping join message")
	}

	done := make(chan struct{})

	defer func() {
		close(done)
		client.Close()
	}()

	go func() {
		<-done
		clientsMu.Lock()
		delete(clients, client)
		log.Println("Client disconnected:", user.Username)
		leaveMsg := model.ChatMessage{
			UserID:    user.ID,
			Username:  user.Username,
			Content:   fmt.Sprintf("%s leave", user.Username),
			Timestamp: time.Now().Unix(),
			Type:      model.LeaveType,
		}
		select {
		case broadcast <- leaveMsg:
			if enableChatCache && redisClient != nil {
				ctx := context.Background()
				msgJSON, _ := json.Marshal(leaveMsg)
				redisClient.LPush(ctx, "chat_history", msgJSON)
				redisClient.LTrim(ctx, "chat_history", 0, 49)
			}
		default:
			log.Println("Broadcast channel full, dropping leave message")
		}
		clientsMu.Unlock()
	}()

	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := client.WriteMessage(websocket.PingMessage, nil); err != nil {
					log.Println("Ping failed, closing connection:", err)
					client.Close()
					return
				}
			case <-done:
				return
			}
		}
	}()
	conn.SetPongHandler(func(string) error {
		log.Println("Pong received from", user.Username)
		return nil
	})

	type Content struct {
		Content string `json:"content"`
	}

	for {
		var content Content
		err := conn.ReadJSON(&content)
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure) {
				log.Printf("Client %s closed connection normally", user.Username)
			} else {
				log.Printf("read error for %s: %v", user.Username, err)
			}
			break
		}

		msg := model.ChatMessage{
			UserID:    user.ID,
			Username:  user.Username,
			Content:   content.Content,
			Timestamp: time.Now().Unix(),
			Type:      model.MessageType,
		}

		bufferMu.Lock()
		messageBuffer = append(messageBuffer, msg)
		bufferMu.Unlock()

		select {
		case broadcast <- msg:
			if enableChatCache && redisClient != nil {
				ctx := c.Request.Context()
				msgJSON, _ := json.Marshal(msg)
				redisClient.LPush(ctx, "chat_history", msgJSON)
				redisClient.LTrim(ctx, "chat_history", 0, 49)
			}
		default:
			log.Println("Broadcast channel full, dropping message")
		}
	}
}

func GetChatHistory(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 50
	}

	var messages []model.ChatMessage
	ctx := c.Request.Context()
	cacheHit := false

	if enableChatCache && redisClient != nil {
		cached, err := redisClient.LRange(ctx, "chat_history", 0, int64(limit-1)).Result()
		if err == nil && len(cached) > 0 {
			messages = make([]model.ChatMessage, 0, len(cached))
			for _, msgJSON := range cached {
				var msg model.ChatMessage
				if json.Unmarshal([]byte(msgJSON), &msg) == nil {
					messages = append(messages, msg)
				}
			}
			// log.Printf("Fetched %d messages from Redis cache", len(messages))
			cacheHit = true
		} else if err != nil {
			log.Printf("Failed to fetch from Redis: %v", err)
		}
	}

	if !cacheHit {
		// log.Printf("Fetching from database")
		messages, err = repository.GetChatHistory(limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to fetch chat history"))
			return
		}
		if enableChatCache && redisClient != nil {
			for _, msg := range messages {
				msgJSON, err := json.Marshal(msg)
				if err == nil {
					redisClient.LPush(ctx, "chat_history", msgJSON)
				} else {
					log.Printf("Failed to marshal message for Redis: %v", err)
				}
			}
			redisClient.LTrim(ctx, "chat_history", 0, int64(limit-1))
			log.Printf("Updated Redis cache with %d messages from database", len(messages))
		}
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, messages))
}

func GetOnlineCount(c *gin.Context) {
	clientsMu.Lock()
	count := len(clients)
	clientsMu.Unlock()
	c.JSON(http.StatusOK, Success(http.StatusOK, map[string]int{"online": count}))
}
