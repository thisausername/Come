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

func QueryUser(userId uint) (model.User, error) {
	var user model.User
	err := dB.Where("id = ?", userId).First(&user).Error
	return user, err
}

func CreateUser(user *model.User) error {
	return dB.Create(user).Error
}

func UpdateUser(userId uint, updates map[string]any) error {
	return dB.Model(&model.User{}).Where("id = ?", userId).Updates(updates).Error
}

func DeleteUser(userId uint) error {
	return dB.Where("id = ?", userId).Delete(&model.User{}).Error
}
