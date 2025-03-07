package model

import "time"

type UserRole int

const (
	RoleUser UserRole = iota
	RoleAdmin
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"not null" json:"username"`
	Email     string    `gorm:"unique;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	Role      UserRole  `gorm:"not null;default:0" json:"role"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
