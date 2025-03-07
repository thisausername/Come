package controller

import (
	"come-back/model"
	"come-back/repository"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PromoteToAdmin(email string) error {
	user, err := repository.QueryUserByEmail(email)
	if err != nil {
		return fmt.Errorf("user not found")
	}
	return repository.UpdateUser(user.ID, map[string]any{"role": model.RoleAdmin})
}

func GetAllUser(c *gin.Context) {
	users, err := repository.QueryAllUsers()
	if err != nil {
		code := http.StatusInternalServerError
		c.JSON(code, Error(code, err))
	} else {
		code := http.StatusAccepted
		c.JSON(code, Success(code, users))
	}
}

func AdminDashboard(c *gin.Context) {

}
