package controller

import (
	"come-back/model"
	"come-back/repository"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAllUsers(c *gin.Context) {
	users, err := repository.QueryAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, err))
		return
	}
	c.JSON(http.StatusOK, Success(http.StatusOK, users))
}

func BanUser(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid user ID"))
		return
	}

	var input struct {
		Banned bool `json:"banned" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid request format"))
		return
	}

	if err := repository.UpdateUser(uint(userID), map[string]interface{}{"banned": input.Banned}); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to update user"))
		return
	}
	status := "banned"
	if !input.Banned {
		status = "unbanned"
	}
	c.JSON(http.StatusOK, Success(http.StatusOK, fmt.Sprintf("user %s successfully", status)))
}

func PromoteToAdmin(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid user ID"))
		return
	}

	if err := repository.UpdateUser(uint(userID), map[string]interface{}{"role": model.RoleAdmin}); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to promote user"))
		return
	}
	c.JSON(http.StatusOK, Success(http.StatusOK, "user promoted to admin"))
}

func DeletePostAdmin(c *gin.Context) {
	postID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid post ID"))
		return
	}

	if err := repository.DeletePost(uint(postID)); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to delete post"))
		return
	}
	c.JSON(http.StatusOK, Success(http.StatusOK, "post deleted successfully"))
}

func DeleteCommentAdmin(c *gin.Context) {
	commentID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid comment ID"))
		return
	}

	if err := repository.DeleteComment(uint(commentID)); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to delete comment"))
		return
	}
	c.JSON(http.StatusOK, Success(http.StatusOK, "comment deleted successfully"))
}

func AdminDashboard(c *gin.Context) {
	usersCount, _ := repository.CountUsers()
	postsCount, _ := repository.CountPosts()
	commentsCount, _ := repository.CountComments()

	data := map[string]interface{}{
		"users_count":    usersCount,
		"posts_count":    postsCount,
		"comments_count": commentsCount,
	}
	c.JSON(http.StatusOK, Success(http.StatusOK, data))
}
