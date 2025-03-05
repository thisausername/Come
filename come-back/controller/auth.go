package controller

import (
	"come-back/model"
	"come-back/repository"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	resp := processRegister(c)
	c.JSON(resp.Code, resp)
}

func Login(c *gin.Context) {
	resp := processLogin(c)
	c.JSON(resp.Code, resp)
}

func processRegister(c *gin.Context) *ServerResponse[string] {
	var user model.User

	if err := c.ShouldBindJSON(&user); err != nil {
		return Error(http.StatusBadRequest, "wrong request format")
	}
	if user.Email == "" || user.Username == "" || user.Password == "" {
		return Error(http.StatusBadRequest, "missing required registration information")
	}

	if _, err := repository.GetUserByEmail(user.Email); err == nil {
		return Error(http.StatusConflict, "email already in use")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return Error(http.StatusInternalServerError, "failed to hash password")
	}
	user.Password = string(hashedPassword)

	if err := repository.DB.Create(&user).Error; err != nil {
		return Error(http.StatusInternalServerError, "faild to save user to database")
	}

	return Success(http.StatusCreated, "register successful")
}

func processLogin(c *gin.Context) *ServerResponse[string] {
	var loginReq struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	c.ShouldBindJSON(&loginReq)

	if _, err := repository.GetUserByEmail(loginReq.Email); err != nil {
		return Error(http.StatusBadRequest, "account not exist")
	}

	var user model.User
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password)); err != nil {
		return Error(http.StatusBadRequest, "wrong password")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(os.Getenv("JWT_SECERT")))

	return Success(http.StatusAccepted, tokenString)
}
