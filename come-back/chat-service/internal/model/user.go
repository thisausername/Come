package model

type User struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
}

type UserProvider interface {
	GetUserByID(id uint) (User, error)
}
