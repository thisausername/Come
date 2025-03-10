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
	router.Static("/uploads", "./uploads")

	api := router.Group("/api")
	{
		public := api.Group("")
		{
			public.POST("/login", controller.Login)
			public.POST("/register", controller.Register)

			public.GET("/posts", controller.GetPostsPaginated)
			public.GET("/post/:id", controller.GetPost)
			public.GET("/post/:id/comments", controller.GetPostComments)

			public.GET("/user/:id", controller.GetUser)
			public.GET("/users/batch", controller.GetUsersBatch)
		}

		auth := api.Group("").Use(middleware.UserAuth())
		{
			auth.GET("/profile", controller.GetProfile)
			auth.PUT("/profile", controller.UpdateProfile)
			auth.POST("/avatar", controller.UploadAvatar)

			auth.POST("/post", controller.CreatePost)
			auth.POST("/post/:id/comment", controller.CreateComment)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}
