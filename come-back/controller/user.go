package controller

import (
	"come-back/model"
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

func GetAllPost(c *gin.Context) {
	users, err := repository.QueryAllPosts()
	if err != nil {
		code := http.StatusInternalServerError
		c.JSON(code, Error(code, err))
	} else {
		code := http.StatusAccepted
		c.JSON(code, Success(code, users))
	}
}

func Post(c *gin.Context) {
	resp := processPost(c)
	c.JSON(resp.Code, resp)
}

func processPost(c *gin.Context) *ServerResponse[string] {
	authorID, exists := c.Get("userID")
	if !exists {
		return Error(http.StatusUnauthorized, "user not authenticated")
	}

	var postInput struct {
		Title   string `json:"title" binding:"required,max=100"`
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&postInput); err != nil {
		return Error(http.StatusBadRequest, "invalid request format: "+err.Error())
	}

	post := model.Post{
		Title:    postInput.Title,
		Content:  postInput.Content,
		AuthorID: authorID.(uint),
	}
	if repository.CreatePost(&post) != nil {
		return Error(http.StatusInternalServerError, "failed to save post")
	}

	return Success(http.StatusCreated, "post successful")
}
