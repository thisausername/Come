package controller

import (
	"come-back/model"
	"come-back/repository"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(400, gin.H{"error": "wrong request format"})
		return
	}
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)
	if err := repository.DB.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "register failed"})
	}
	c.JSON(201, gin.H{"message": "register success"})
}

func Login(c *gin.Context) {
	var loginReq struct {
		Username string `json:"username"`
		Password string `json:"username`
	}
	c.ShouldBindJSON(&loginReq)

	var user model.User
	if err := repository.DB.Where("username = ?", loginReq.Username).First(&user).Error; err != nil {
		c.JSON(401, gin.H{"error": "user not exist"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password)); err != nil {
		c.JSON(401, gin.H{"error": "wrong passward"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(os.Getenv("JWT_SECERT")))
	c.JSON(200, gin.H{"token": tokenString})
}

func GetProfile(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	var user model.User
	if err := repository.DB.First(&user, userID).Error; err != nil {
		c.JSON(404, gin.H{"error": "user not exist"})
		return
	}
	c.JSON(200, gin.H{"username": user.Username, "email": user.Email})
}
