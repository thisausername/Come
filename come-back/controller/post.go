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

func GetPostsPaginated(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("pageSize", "10")
	page, _ := strconv.Atoi(pageStr)
	pageSize, _ := strconv.Atoi(pageSizeStr)

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize
	posts, total, err := repository.QueryPostsPaginated(offset, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to fetch posts"))
	}

	c.JSON(
		http.StatusOK,
		Success(http.StatusOK, map[string]any{
			"posts":    posts,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		}))
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

func CreatePost(c *gin.Context) {
	authorID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Error(http.StatusUnauthorized, "user not authenticated"))
		return
	}

	banned, err := repository.UserIsBanned(authorID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to validate author"))
		return
	}
	if banned {
		c.JSON(http.StatusForbidden, Error(http.StatusForbidden, "user banned"))
		return
	}

	var postInput struct {
		Title   string `json:"title" binding:"required,max=50"`
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&postInput); err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid request format: "+err.Error()))
		return
	}

	post := model.Post{
		Title:    postInput.Title,
		Content:  postInput.Content,
		AuthorID: authorID.(uint),
	}
	if repository.CreatePost(&post) != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to save post"))
		return
	}

	c.JSON(http.StatusCreated, Success(http.StatusCreated, "post successful"))
}

func UpdatePost(c *gin.Context) {
	authorID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Error(http.StatusUnauthorized, "user not authenticated"))
		return
	}

	banned, err := repository.UserIsBanned(authorID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to validate author"))
		return
	}
	if banned {
		c.JSON(http.StatusForbidden, Error(http.StatusForbidden, "user banned"))
		return
	}

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

	if post.AuthorID != authorID.(uint) {
		c.JSON(http.StatusForbidden, Error(http.StatusForbidden, "you can only update your own posts"))
		return
	}

	var postInput struct {
		Title   string `json:"title" binding:"required,max=50"`
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&postInput); err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid request format: "+err.Error()))
		return
	}

	updates := map[string]any{
		"title":   postInput.Title,
		"content": postInput.Content,
	}

	if err := repository.UpdatePost(uint(postID), updates); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to update post"))
		return
	}

	updatedPost, err := repository.QueryPost(uint(postID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to fetch updated post"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, updatedPost))
}

func DeletePost(c *gin.Context) {
	authorID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Error(http.StatusUnauthorized, "user not authenticated"))
		return
	}

	banned, err := repository.UserIsBanned(authorID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to validate author"))
		return
	}
	if banned {
		c.JSON(http.StatusForbidden, Error(http.StatusForbidden, "user banned"))
		return
	}

	postIDStr := c.Param("id")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid post id"))
		return
	}

	post, err := repository.QueryPost(uint(postID))
	if err != nil {
		c.JSON(http.StatusNotFound, Error(http.StatusNotFound, "post not found"))
		return
	}

	if post.AuthorID != authorID.(uint) {
		c.JSON(http.StatusForbidden, Error(http.StatusForbidden, "you can only delete your own posts"))
		return
	}

	if err := repository.DeletePost(uint(postID)); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to delete post"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, "post deleted successfully"))
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

	banned, err := repository.UserIsBanned(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "failed to validate author"))
		return
	}
	if banned {
		c.JSON(http.StatusForbidden, Error(http.StatusForbidden, "user banned"))
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

// 新增点赞处理
func ToggleLike(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	postID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid post ID"))
		return
	}

	var input struct {
		State bool `json:"state"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "invalid request"))
		return
	}

	if err := repository.ToggleLike(uint(postID), userID, input.State); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "操作失败"))
		return
	}

	post, err := repository.QueryPostWithAuth(uint(postID), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "获取数据失败"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, post))
}

// 新增收藏处理函数
func ToggleBookmark(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, Error(http.StatusUnauthorized, "用户未登录"))
		return
	}

	postID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "无效的帖子ID"))
		return
	}

	var input struct {
		State bool `json:"state"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, Error(http.StatusBadRequest, "无效请求格式"))
		return
	}

	// 检查用户是否被禁言
	banned, err := repository.UserIsBanned(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "无法验证用户状态"))
		return
	}
	if banned {
		c.JSON(http.StatusForbidden, Error(http.StatusForbidden, "用户已被禁言"))
		return
	}

	// 执行收藏操作
	if err := repository.ToggleBookmark(uint(postID), userID.(uint), input.State); err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "操作失败"))
		return
	}

	// 获取更新后的帖子数据
	updatedPost, err := repository.QueryPostWithAuth(uint(postID), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, Error(http.StatusInternalServerError, "获取数据失败"))
		return
	}

	c.JSON(http.StatusOK, Success(http.StatusOK, updatedPost))
}
