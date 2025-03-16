package controller

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

func WsOptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.Query("token")
		if tokenString != "" {
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				return []byte(os.Getenv("JWT_SECRET")), nil
			})
			if err != nil || !token.Valid {
				c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "invalid token"})
				return
			}
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claim"})
				return
			}

			user_id := uint(claims["user_id"].(float64))
			c.Set("user_id", user_id)
		}
		c.Next()
	}
}
