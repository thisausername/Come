package main

import (
	"log"
	"os"

	"come-back/controller"
	"come-back/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("error loading .env file!")
	}

	if err := repository.InitMySQL(os.Getenv("MYSQL_DSN")); err != nil {
		log.Fatal(err)
	}

	router := gin.Default()
	public := router.Group("/api")
	{
		public.POST("/register", controller.Register)
		public.POST("/login", controller.Login)
	}

	// protected := public.Use(middleware.JwtAuth())
	// {
	// 	protected.GET("/profile", controller.GetProfile)
	// 	// protected.POST("/posts", controller.GreatePost)
	// }

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}
