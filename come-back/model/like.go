package model

type Like struct {
	ID     uint `gorm:"primaryKey"`
	UserID uint `gorm:"index"`
	PostID uint `gorm:"index"`
}
