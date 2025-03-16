package repository

import "chat-service/internal/model"

func CreateChatMessage(msg *model.ChatMessage) error {
	return dB.Create(msg).Error
}

func CreateChatMessages(msgs []model.ChatMessage) error {
	return dB.Create(&msgs).Error
}

func GetChatHistory(limit int) ([]model.ChatMessage, error) {
	var messages []model.ChatMessage
	err := dB.Order("timestamp ASC").Limit(limit).Find(&messages).Error
	return messages, err
}
