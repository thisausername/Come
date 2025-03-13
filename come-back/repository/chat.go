package repository

import "come-back/model"

func CreateChatMessage(msg *model.ChatMessage) error {
	return dB.Create(msg).Error
}

func GetChatHistory(limit int) ([]model.ChatMessage, error) {
	var messages []model.ChatMessage
	err := dB.Order("timestamp ASC").Limit(limit).Find(&messages).Error
	return messages, err
}
