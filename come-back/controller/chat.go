package controller

import (
	"come-back/model"
	"come-back/repository"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var (
	clients   = make(map[*Client]bool)
	clientsMu sync.Mutex
	broadcast = make(chan model.ChatMessage)
)

type Client struct {
	conn *websocket.Conn
	user model.User
	mu   sync.Mutex
}

func (c *Client) WriteJSON(v any) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.conn.WriteJSON(v)
}

func (c *Client) WriteMessage(messageType int, data []byte) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.conn.WriteMessage(messageType, data)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

var once sync.Once

func init() {
	once.Do(func() {
		go func() {
			for msg := range broadcast {
				clientsMu.Lock()
				for client := range clients {
					err := client.WriteJSON(msg)
					if err != nil {
						log.Println("write error:", err)
						client.conn.Close()
						delete(clients, client)
					}
				}
				clientsMu.Unlock()
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

	client := &Client{conn: conn, user: user}
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
	broadcast <- joinMsg

	defer func() {
		clientsMu.Lock()
		delete(clients, client)
		log.Println("Client disconnected via defer:", user.Username)
		leaveMsg := model.ChatMessage{
			UserID:    user.ID,
			Username:  user.Username,
			Content:   fmt.Sprintf("%s leave", user.Username),
			Timestamp: time.Now().Unix(),
			Type:      model.LeaveType,
		}
		broadcast <- leaveMsg
		clientsMu.Unlock()
		conn.Close()
	}()

	go func() {
		for {
			time.Sleep(time.Minute)
			if err := client.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Println("Ping failed, closing connection:", err)
				conn.Close()
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
			log.Println("read error:", err)
			break
		}
		msg := model.ChatMessage{
			UserID:    user.ID,
			Username:  user.Username,
			Content:   content.Content,
			Timestamp: time.Now().Unix(),
			Type:      model.MessageType,
		}
		if err := repository.CreateChatMessage(&msg); err != nil {
			log.Println("failed to save chat message:", err)
		}
		broadcast <- msg
	}
}

func GetChatHistory(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 50
	}

	messages, err := repository.GetChatHistory(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to fetch chat history"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, messages))
}

func GetOnlineCount(c *gin.Context) {
	clientsMu.Lock()
	count := len(clients)
	clientsMu.Unlock()
	c.JSON(http.StatusOK, Success(http.StatusOK, map[string]int{"online": count}))
}
