package middleware

import (
	"come-back/model"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func UserAuth() gin.HandlerFunc {
	return jwtAuth(model.RoleUser)
}

func AdminAuth() gin.HandlerFunc {
	return jwtAuth(model.RoleAdmin)
}

// func jwtAuth(allow_role model.UserRole) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		log.Printf("JWT middleware called for %s %s", c.Request.Method, c.Request.URL.Path)

// 		log.Println("All Request Headers:")
// 		for key, values := range c.Request.Header {
// 			log.Printf("%s: %v", key, values)
// 		}

// 		tokenString := c.GetHeader("Authorization")
// 		log.Println("Extracted tokenstr =", tokenString)
// 		if tokenString == "" {
// 			log.Println("No Authorization header found in request")
// 			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "auth token missing"})
// 			return
// 		}

// 		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
// 			return []byte(os.Getenv("JWT_SECRET")), nil
// 		})
// 		if err != nil || !token.Valid {
// 			log.Printf("Token parsing failed: %v", err)
// 			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token: " + err.Error()})
// 			return
// 		}

// 		claims, ok := token.Claims.(jwt.MapClaims)
// 		if !ok {
// 			log.Println("Invalid token claims")
// 			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claim"})
// 			return
// 		}

// 		userID, ok := claims["user_id"].(float64)
// 		if !ok {
// 			log.Println("user_id not found in token")
// 			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user_id not found in token"})
// 			return
// 		}

// 		role, ok := claims["role"].(float64)
// 		if !ok {
// 			log.Println("role not found in token")
// 			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "role not found in token"})
// 			return
// 		}

// 		if model.UserRole(role) != allow_role {
// 			log.Printf("Forbidden: expected role %d, got %d", allow_role, uint(role))
// 			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
// 			return
// 		}

// 		log.Printf("Token validated: user_id=%d, role=%d", uint(userID), uint(role))
// 		c.Set("user_id", uint(userID))
// 		c.Set("role", model.UserRole(role))
// 		c.Next()
// 	}
// }

func jwtAuth(allow_role model.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "auth token missing"})
			return
		}

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
		role := model.UserRole(int(claims["role"].(float64)))
		if role != allow_role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}

		c.Set("user_id", user_id)
		c.Set("role", role)
		c.Next()
	}
}
