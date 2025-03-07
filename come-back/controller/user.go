package controller

import (
	"come-back/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, Error(http.StatusUnauthorized, "Unauthorized"))
		return
	}

	user, err := repository.QueryUser(userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, Error(http.StatusNotFound, "User not found"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, user))
}
