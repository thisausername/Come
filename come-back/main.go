package main

import (
	"log"
	"os"

	"come-back/controller"
	"come-back/middleware"
	"come-back/repository"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("error loading environment variables!")
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

	test := router.Group("/test")
	{
		test.GET("/users", controller.GetAllUser)
	}

	user := router.Group("/user").Use(middleware.UserAuth())
	{
		user.GET("/profile", controller.GetProfile)
	}

	admin := router.Group("/admin").Use(middleware.AdminAuth())
	{
		admin.GET("/dashboard", controller.AdminDashboard)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}
