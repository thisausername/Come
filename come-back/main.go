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
		public.POST("/login", controller.Login)
		public.POST("/register", controller.Register)
		public.GET("/posts", controller.GetAllPost)
		public.GET("/post/:id", controller.GetPost)
		public.GET("/post/:id/comments", controller.GetPostComments)
	}

	test := router.Group("/test")
	{
		test.GET("/users", controller.GetAllUser)
		test.GET("/posts", controller.GetAllPost)
	}

	user := router.Group("/user").Use(middleware.UserAuth())
	{
		user.GET("/profile", controller.GetProfile)
		user.POST("/post", controller.Post)
		user.POST("/post/:id/comment", controller.CreateComment)
	}

	admin := router.Group("/admin").Use(middleware.AdminAuth())
	{
		admin.GET("/dashboard", controller.AdminDashboard)
		admin.GET("/users", controller.GetAllUser)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}
