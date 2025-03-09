package controller

import (
	"come-back/repository"
	"come-back/util"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func UploadAvatar(c *gin.Context) *ServerResponse[string] {
	userID, exists := c.Get("user_id")
	if !exists {
		return Error(http.StatusUnauthorized, "user not authenticated")
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		return Error(http.StatusBadRequest, "failed to upload avatar")
	}

	if file.Size > 5<<20 {
		return Error(http.StatusBadRequest, "avatar file too large (max 5MB)")
	}

	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return Error(http.StatusBadRequest, "only JPG and PNG files are allowed")
	}

	filename := fmt.Sprintf("%d_%s%s", userID, util.GenerateRandomString(8), ext)
	savePath := filepath.Join("uploads/avatars", filename)

	if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
		return Error(http.StatusInternalServerError, "server error")
	}

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		return Error(http.StatusInternalServerError, "failed to save avatar")
	}

	if err := repository.UpdateUser(userID.(uint), map[string]any{"avatar": savePath}); err != nil {
		return Error(http.StatusInternalServerError, "failed to update avatar")
	}

	return Success(http.StatusOK, savePath)
}

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
