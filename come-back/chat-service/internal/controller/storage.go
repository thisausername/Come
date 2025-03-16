package controller

import (
	"chat-service/internal/model"
	"chat-service/internal/repository"
	"context"
	"encoding/json"
	"log"
	"os"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/joho/godotenv"
)

var (
	batchSize     = 100
	messageBuffer = make([]model.ChatMessage, 0, batchSize)
	bufferMu      sync.Mutex
	batchInterval = 5 * time.Second

	redisClient     *redis.Client
	enableChatCache bool
)

func InitRedis() {
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

func StartMessageBatcher() {
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
}

func SaveMessageToCache(ctx context.Context, msg model.ChatMessage) {
	if enableChatCache && redisClient != nil {
		msgJSON, _ := json.Marshal(msg)
		redisClient.LPush(ctx, "chat_history", msgJSON)
		redisClient.LTrim(ctx, "chat_history", 0, 49)
	}
}

func GetChatHistory(ctx context.Context, limit int) ([]model.ChatMessage, error) {
	var messages []model.ChatMessage
	cacheHit := false
	if enableChatCache && redisClient != nil {
		cached, err := redisClient.LRange(ctx, "chat_history", 0, int64(limit-1)).Result()
		if err == nil && len(cached) > 0 {
			messages = make([]model.ChatMessage, 0, len(cached))
			for i, msgJSON := range cached {
				var msg model.ChatMessage
				if err := json.Unmarshal([]byte(msgJSON), &msg); err != nil {
					log.Printf("Failed to unmarshal message %d: %v, JSON: %s", i, err, msgJSON)
					continue
				}
				messages = append(messages, msg)
			}

			if len(messages) > 0 {
				cacheHit = true
			}
		} else if err != nil {
			log.Printf("Failed to fetch from Redis: %v", err)
		}
	}

	if !cacheHit {
		var err error
		messages, err = repository.GetChatHistory(limit)
		if err != nil {
			return nil, err
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

	return messages, nil
}
