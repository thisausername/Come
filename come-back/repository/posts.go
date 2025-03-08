package repository

import "come-back/model"

func QueryAllPosts() ([]model.Post, error) {
	var posts []model.Post
	err := dB.Find(&posts).Error
	return posts, err
}

func QueryPost(postId uint) (model.Post, error) {
	var post model.Post
	err := dB.Where("id = ?", postId).First(&post).Error
	return post, err
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
