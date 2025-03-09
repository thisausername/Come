package controller

import (
	"come-back/model"
	"come-back/repository"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

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

func GetPost(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid post ID"))
		return
	}

	post, err := repository.QueryPost(uint(postID))
	if err != nil {
		c.JSON(http.StatusNotFound, Error(http.StatusNotFound, "post not found"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, post))
}

func Post(c *gin.Context) {
	resp := processPost(c)
	c.JSON(resp.Code, resp)
}

func processPost(c *gin.Context) *ServerResponse[string] {
	authorID, exists := c.Get("user_id")
	if !exists {
		return Error(http.StatusUnauthorized, "user not authenticated")
	}

	var postInput struct {
		Title   string `json:"title" binding:"required,max=50"`
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

func GetPostComments(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		log.Printf("Invalid post ID: %v", err)
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid post ID"))
		return
	}

	comments, err := repository.QueryAllComments(uint(postID))
	if err != nil {
		log.Printf("Failed to fetch comments for post %d: %v", postID, err)
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to fetch comments"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, comments))
}

func CreateComment(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		log.Printf("Invalid post ID: %v", err)
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid post ID"))
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Error(http.StatusUnauthorized, "user not authenticated"))
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Invalid request: %v", err)
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid request"))
		return
	}

	comment := model.Comment{
		PostID:   uint(postID),
		AuthorID: userID.(uint),
		Content:  input.Content,
	}

	if repository.CreateComment(&comment) != nil {
		log.Printf("Failed to create comment: %v", err)
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to create comment"))
		return
	}

	c.JSON(http.StatusCreated, Success(http.StatusCreated, comment))
}
