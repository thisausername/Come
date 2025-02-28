# build 

FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o Come ./main.go


# image

FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/Come ./
COPY ./config/config.yaml ./config/

EXPOSE 8080
CMD ["./Come"]

