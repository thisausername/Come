package repository

import (
	"come-back/model"
)

func QueryUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := dB.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func QueryAllUsers() ([]model.User, error) {
	var users []model.User
	if err := dB.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func QueryUser(userID uint) (model.User, error) {
	var user model.User
	err := dB.Where("id = ?", userID).First(&user).Error
	return user, err
}

func CreateUser(user *model.User) error {
	return dB.Create(user).Error
}

func UpdateUser(userID uint, updates map[string]any) error {
	return dB.Model(&model.User{}).Where("id = ?", userID).Updates(updates).Error
}

func DeleteUser(userID uint) error {
	return dB.Where("id = ?", userID).Delete(&model.User{}).Error
}
