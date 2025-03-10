package controller

import (
	"come-back/model"
	"come-back/repository"
	"come-back/util"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetUser(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "Invalid user id"))
	}
	user, err := repository.QueryUser(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, Error(http.StatusNotFound, "User not found"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, user))
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

func GetUsersBatch(c *gin.Context) {
	idsStr := c.Query("ids")
	if idsStr == "" {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "ids parameter is required"))
	}

	ids := strings.Split(idsStr, ",")
	var userIDs []uint
	for _, id := range ids {
		if uid, err := strconv.ParseUint(id, 10, 32); err == nil {
			userIDs = append(userIDs, uint(uid))
		}
	}

	users, err := repository.QueryUsers(userIDs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to fetch users"))
	}

	userMap := make(map[uint]model.User)
	for _, user := range users {
		userMap[user.ID] = user
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, userMap))
}

func UploadAvatar(c *gin.Context) {
	response := uploadAvatar(c)
	c.JSON(response.Code, response)
}

func UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Error(http.StatusUnauthorized, "user not authenticated"))
	}

	var input struct {
		Username string `json:"username" binding:"required,max=50"`
		Email    string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid request format: "+err.Error()))
	}

	updates := map[string]any{
		"username": input.Username,
		"email":    input.Email,
	}
	if err := repository.UpdateUser(userID.(uint), updates); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to update profile"))
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, "profile updated successfully"))
}

func uploadAvatar(c *gin.Context) *ServerResponse[string] {
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

	user, err := repository.QueryUser(userID.(uint))
	if err != nil {
		return Error(http.StatusInternalServerError, "failed to fetch user profile")
	}
	oldAvatarPath := user.Avatar

	filename := fmt.Sprintf("%d_%s%s", userID, util.GenerateRandomString(8), ext)
	savePath := filepath.Join("uploads/avatars", filename)

	if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
		return Error(http.StatusInternalServerError, "server error")
	}

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		os.Remove(savePath)
		return Error(http.StatusInternalServerError, "failed to save avatar")
	}

	if err := repository.UpdateUser(userID.(uint), map[string]any{"avatar": savePath}); err != nil {
		return Error(http.StatusInternalServerError, "failed to update avatar")
	}

	if oldAvatarPath != "" && oldAvatarPath != savePath {
		if err := os.Remove(oldAvatarPath); err != nil {
			fmt.Println("Failed to delete old avatar:", err)
		}
	}

	return Success(http.StatusOK, savePath)
}
