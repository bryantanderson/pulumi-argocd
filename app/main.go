package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func handlePing(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, gin.H{"message": "pong"})
}

func main() {
	fmt.Println("API server is running...")
	router := gin.Default()
	router.POST("/ping", handlePing)
	router.Run("localhost:8080")
}
