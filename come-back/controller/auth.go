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
	"gorm.io/gorm"
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
	var regReq struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&regReq); err != nil {
		return Error(http.StatusBadRequest, "wrong request format")
	}
	if regReq.Email == "" || regReq.Username == "" || regReq.Password == "" {
		return Error(http.StatusBadRequest, "missing required registration information")
	}

	if _, err := repository.QueryUserByEmail(regReq.Email); err == nil {
		return Error(http.StatusConflict, "email already in use")
	} else if err != gorm.ErrRecordNotFound {
		return Error(http.StatusInternalServerError, "database error")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(regReq.Password), bcrypt.DefaultCost)
	if err != nil {
		return Error(http.StatusInternalServerError, "failed to hash password")
	}

	user := model.User{
		Email:    regReq.Email,
		Username: regReq.Username,
		Password: string(hashedPassword),
	}

	if repository.CreateUser(&user) != nil {
		return Error(http.StatusInternalServerError, "failed to save user")
	}

	return Success(http.StatusCreated, "register successful")
}

func processLogin(c *gin.Context) *ServerResponse[string] {
	var loginReq struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	c.ShouldBindJSON(&loginReq)

	user, err := repository.QueryUserByEmail(loginReq.Email)
	if err != nil {
		return Error(http.StatusBadRequest, "account not exist")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password)); err != nil {
		return Error(http.StatusBadRequest, "wrong password")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(os.Getenv("JWT_SECERT")))

	return Success(http.StatusAccepted, tokenString)
}
