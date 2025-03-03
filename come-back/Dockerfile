# build 
FROM golang:1.24-bookworm AS builder

WORKDIR /app
COPY go.mod .
ENV GOPROXY=https://goproxy.cn,direct
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o come-back .


# image

FROM debian:12-slim

WORKDIR /app
COPY --from=builder /app/come-back .

EXPOSE 8080
CMD ["./come-back"]

