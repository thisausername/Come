package controller

import (
	"chat-service/internal/model"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	clients   = make(map[*Client]bool)
	clientsMu sync.Mutex
	broadcast = make(chan model.ChatMessage, 512)
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

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

func BroadcastMessage(msg model.ChatMessage) {
	select {
	case broadcast <- msg:
	default:
		log.Println("Broadcast channel full, dropping message")
	}
}

func StartWebSocketManager() {
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
}
