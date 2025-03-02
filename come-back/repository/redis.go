package repository

import (
	"fmt"
	"context"
	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client

func InitRedis(addr string) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:		addr,
		Password: 	"",
		DB:			0,
	})

	_, err := RedisClient.Ping(context.Background()).Result()
	if err != nil {
		return fmt.Errorf("Redis connection failed: %v", err)
	}

	fmt.Println("Redis connected")
	return nil
}
