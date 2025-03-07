package model

import "time"

type UserRole int

const (
	RoleUser UserRole = iota
	RoleAdmin
)

type User struct {
	ID        uint      `gorm:"primaryKey"`
	Username  string    `gorm:"not null"`
	Email     string    `gorm:"unique;not null"`
	Password  string    `gorm:"not null"`
	Role      UserRole  `gorm:"not null;default:0"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}
