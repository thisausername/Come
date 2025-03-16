# Come: A Simple Web Application

"Come" is a web application designed to provide a platform for users to interact online. It features a backend built with Go, a frontend powered by React and TypeScript, and a microservices-inspired architecture for scalability. This project is still in early development, with ongoing refinements to its features and structure.

## Project Structure
- **`come-back/`**: Backend services written in Go.
  - **`chat-service/`**: A standalone microservice for real-time chat functionality.
  - Other backend components include user management, posts, and admin.
- **`come-front/`**: Frontend built with React, TypeScript, and Vite, served via Nginx.
- **`docker-compose.yml`**: Orchestrates the entire application stack.
- **`tests/`**: Contains performance and functional tests using Locust and Fish scripts.

## Prerequisites
- Docker and Docker Compose
- Go (optional, for local development)
- Node.js (optional, for local development)

## Building and Running
Follow these steps to build and deploy the application locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sevetis/Come.git
   cd come
   ```

2. Set Up Environment Variables

    Create a .env file in the root directory based on your configuration. Example:
    ```.env
    MYSQL_USER=come_user
    MYSQL_PASSWORD=come_pwd
    MYSQL_DATABASE=come_db
    MYSQL_ROOT_PASSWORD=root_pass
    MYSQL_DSN=${MYSQL_USER}:${MYSQL_PASSWORD}@tcp(mysql:3306)/${MYSQL_DATABASE}?charset=utf8mb4&parseTime=True&loc=Local

    REDIS_ADDR=redis:6379
    USE_CHAT_CACHE=true

    ADMIN_NAME=admin
    ADMIN_EMAIL=admin@come.com
    ADMIN_PASSWORD=admin
    ```

3. Build and Start Services

    Run the following command to build and start all services:
    ```bash
    docker-compose up --build
    ```

4. Access service
    
    Access the application on http://localhost


5. Stop Services

    To stop the application:
    ```bash
    docker-compose down
    ```