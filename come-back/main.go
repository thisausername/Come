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

	public := router.Group("/api")
	{
		public.POST("/login", controller.Login)
		public.POST("/register", controller.Register)
		public.GET("/posts", controller.GetPostsPaginated)
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
		user.POST("/post", controller.Post)
		user.POST("/post/:id/comment", controller.CreateComment)

		user.GET("/profile", controller.GetProfile)
		user.PUT("/profile", func(c *gin.Context) {
			resp := controller.UpdateProfile(c)
			c.JSON(resp.Code, resp)
		})
		user.POST("/avatar", func(c *gin.Context) {
			resp := controller.UploadAvatar(c)
			c.JSON(resp.Code, resp)
		})
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
