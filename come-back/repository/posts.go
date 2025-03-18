package repository

import "come-back/model"

func QueryAllPosts() ([]model.Post, error) {
	var posts []model.Post
	err := dB.Find(&posts).Error
	return posts, err
}

// 修改现有查询方法
func QueryPost(postId uint) (model.Post, error) {
	var post model.Post
	err := dB.Where("id = ?", postId).First(&post).Error
	return post, err
}

func QueryPostsPaginated(offset, limit int) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	// 查询总数
	if err := dB.Model(&model.Post{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查询分页数据
	if err := dB.Offset(offset).Limit(limit).Order("created_at DESC").Find(&posts).Error; err != nil {
		return nil, 0, err
	}

	return posts, total, nil
}

func QueryPostWithAuth(postId uint, userId uint) (model.Post, error) {
	var post model.Post
	err := dB.Where("id = ?", postId).First(&post).Error
	if err != nil {
		return post, err
	}

	// 获取点赞状态
	var likeCount int64
	dB.Model(&model.Like{}).Where("post_id = ?", postId).Count(&likeCount)
	post.LikesCount = int(likeCount)

	// 获取收藏状态
	var bookmarkCount int64
	dB.Model(&model.Bookmark{}).Where("post_id = ?", postId).Count(&bookmarkCount)

	if userId > 0 {
		var exists int64
		// 检查点赞状态
		dB.Model(&model.Like{}).Where("post_id = ? AND user_id = ?", postId, userId).Count(&exists)
		post.IsLiked = exists > 0

		// 检查收藏状态
		dB.Model(&model.Bookmark{}).Where("post_id = ? AND user_id = ?", postId, userId).Count(&exists)
		post.IsBookmarked = exists > 0
	}

	return post, nil
}

func CreatePost(post *model.Post) error {
	return dB.Create(post).Error
}

func UpdatePost(postId uint, updates map[string]any) error {
	return dB.Model(&model.Post{}).Where("id = ?", postId).Updates(updates).Error
}

func DeletePost(postId uint) error {
	return dB.Where("id = ?", postId).Delete(&model.Post{}).Error
}

func CountPosts() (int64, error) {
	var count int64
	err := dB.Model(&model.Comment{}).Count(&count).Error
	return count, err
}

// 点赞操作
func ToggleLike(postID uint, userID uint, state bool) error {
	if state {
		return dB.Create(&model.Like{PostID: postID, UserID: userID}).Error // 引用Like模型
	}
	return dB.Where("post_id = ? AND user_id = ?", postID, userID).Delete(&model.Like{}).Error
}

// 收藏操作
func ToggleBookmark(postID uint, userID uint, state bool) error {
	if state {
		return dB.Create(&model.Bookmark{PostID: postID, UserID: userID}).Error // 引用Bookmark模型
	}
	return dB.Where("post_id = ? AND user_id = ?", postID, userID).Delete(&model.Bookmark{}).Error
}
