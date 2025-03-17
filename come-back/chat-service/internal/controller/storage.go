package controller

import (
	"chat-service/internal/model"
	"chat-service/internal/repository"
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/joho/godotenv"
)

var (
	syncInterval    = 5 * time.Second
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
			syncDB()
		}
	} else {
		log.Printf("redis disabled")
	}
}

func syncDB() {
	if !enableChatCache || redisClient == nil {
		return
	}
	go func() {
		ticker := time.NewTicker(syncInterval)
		defer ticker.Stop()
		for range ticker.C {
			ctx := context.Background()
			cached, err := redisClient.LRange(ctx, "chat_pending", 0, -1).Result()
			if err != nil || len(cached) == 0 {
				continue
			}

			messages := make([]model.ChatMessage, 0, len(cached))
			for _, msgJSON := range cached {
				var msg model.ChatMessage
				if err := json.Unmarshal([]byte(msgJSON), &msg); err != nil {
					log.Printf("Failed to unmarshal pending message: %v, JSON: %s", err, msgJSON)
					continue
				}
				messages = append(messages, msg)
			}

			if len(messages) > 0 {
				if err := repository.CreateChatMessages(messages); err != nil {
					log.Printf("failed to batch save %d messages to MySQL: %v", len(messages), err)
				} else {
					log.Printf("successfully saved %d messages to MySQL", len(messages))
					redisClient.LTrim(ctx, "chat_pending", int64(len(messages)), -1)
				}
			}
		}
	}()
}

func StoreMessage(ctx context.Context, msg model.ChatMessage) {
	if enableChatCache && redisClient != nil {
		msgJSON, err := json.Marshal(msg)
		if err != nil {
			log.Printf("Failed to marshal message: %v", err)
			return
		}
		redisClient.LPush(ctx, "chat_history", msgJSON)
		redisClient.LPush(ctx, "chat_pending", msgJSON)
		redisClient.LTrim(ctx, "chat_history", 0, 49)
		log.Printf("Saved message to Redis: %+v", msg)
	} else {
		if err := repository.CreateChatMessages([]model.ChatMessage{msg}); err != nil {
			log.Printf("Failed to save message to MySQL: %v", err)
		} else {
			log.Printf("Saved message to MySQL: %+v", msg)
		}
	}
}

func GetChatHistory(ctx context.Context, limit int) ([]model.ChatMessage, error) {
	var messages []model.ChatMessage
	log.Printf("Getting chat history with limit %d", limit)

	if enableChatCache && redisClient != nil {
		cached, err := redisClient.LRange(ctx, "chat_history", 0, int64(limit-1)).Result()
		if err != nil {
			log.Printf("Failed to fetch from Redis: %v", err)
		} else if len(cached) > 0 {
			messages = make([]model.ChatMessage, 0, len(cached))
			for i := len(cached) - 1; i >= 0; i-- {
				var msg model.ChatMessage
				if err := json.Unmarshal([]byte(cached[i]), &msg); err != nil {
					log.Printf("Failed to unmarshal message %d: %v, JSON: %s", i, err, cached[i])
					continue
				}
				messages = append(messages, msg)
			}
			log.Printf("Fetched %d messages from Redis", len(messages))
			return messages, nil
		}
	}

	log.Printf("Fetch data from database")
	messages, err := repository.GetChatHistory(limit)
	if err != nil {
		return nil, err
	}
	log.Printf("Fetched %d messages from MySQL", len(messages))
	return messages, nil
}
