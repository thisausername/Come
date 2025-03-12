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

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Client struct {
	conn *websocket.Conn
	user model.User
}

var (
	clients   = make(map[*Client]bool)
	clientsMu sync.Mutex
	broadcast = make(chan Message)
)

type Message struct {
	UserID    uint   `json:"userId"`
	Username  string `json:"username"`
	Content   string `json:"content"`
	Timestamp int64  `json:"timestamp"`
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

	var response []Message
	for _, msg := range messages {
		var username string
		if msg.UserID != 0 {
			user, err := repository.QueryUser(msg.UserID)
			if err == nil {
				username = user.Username
			} else {
				username = "unknown"
			}
		} else {
			username = fmt.Sprintf("anonymous_%d", msg.ID%1000)
		}
		response = append(response, Message{
			UserID:    msg.UserID,
			Username:  username,
			Content:   msg.Content,
			Timestamp: msg.CreatedAt.Unix(),
		})
	}
	c.JSON(http.StatusOK, Success(http.StatusOK, response))
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

	defer conn.Close()

	client := &Client{conn: conn, user: user}
	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	go func() {
		for msg := range broadcast {
			clientsMu.Lock()
			for client := range clients {
				err := client.conn.WriteJSON(msg)
				if err != nil {
					log.Println("write error:", err)
					client.conn.Close()
					delete(clients, client)
				}
			}
			clientsMu.Unlock()
		}
	}()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("read error:", err)
			clientsMu.Lock()
			delete(clients, client)
			clientsMu.Unlock()
			break
		}
		msg.UserID = user.ID
		msg.Username = user.Username
		msg.Timestamp = time.Now().Unix()

		chatMsg := model.ChatMessage{
			UserID:  user.ID,
			Content: msg.Content,
		}
		if err := repository.CreateChatMessage(&chatMsg); err != nil {
			log.Println("failed to save chat message:", err)
		}

		broadcast <- msg
	}
}
