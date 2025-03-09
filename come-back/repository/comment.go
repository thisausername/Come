package repository

import "come-back/model"

func QueryAllComments(postId uint) ([]model.Comment, error) {
	var comments []model.Comment
	err := dB.Where("post_id = ?", postId).Find(&comments).Error
	if err != nil {
		return nil, err
	}
	return comments, nil
}

func CreateComment(comment *model.Comment) error {
	return dB.Create(comment).Error
}
