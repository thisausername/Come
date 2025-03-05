package controller

type ServerResponse[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

func Error[T any](code int, data T) *ServerResponse[T] {
	return &ServerResponse[T]{Code: code, Message: "", Data: data}
}

func Success[T any](code int, data T) *ServerResponse[T] {
	return &ServerResponse[T]{Code: code, Message: "success", Data: data}
}
