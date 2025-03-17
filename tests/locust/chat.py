from locust import User, task, between, events
import websocket
import json
import time

class WebSocketClient:
    def __init__(self, host, token=""):
        self.ws = websocket.WebSocket()
        self.host = host
        self.token = token
        self.connect()

    def connect(self):
        start_time = time.time()
        try:
            self.ws.connect(f"{self.host}/api/chatroom?token={self.token}")
            events.request.fire(
                request_type="WebSocket",
                name="connect",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
            )
        except Exception as e:
            events.request.fire(
                request_type="WebSocket",
                name="connect",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=e,
            )

    def send(self, message):
        start_time = time.time()
        try:
            self.ws.send(message)
            events.request.fire(
                request_type="WebSocket",
                name="send",
                response_time=(time.time() - start_time) * 1000,
                response_length=len(message),
            )
        except Exception as e:
            events.request.fire(
                request_type="WebSocket",
                name="send",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=e,
            )

    def receive(self):
        start_time = time.time()
        try:
            response = self.ws.recv()
            events.request.fire(
                request_type="WebSocket",
                name="receive",
                response_time=(time.time() - start_time) * 1000,
                response_length=len(response),
            )
            return response
        except Exception as e:
            events.request.fire(
                request_type="WebSocket",
                name="receive",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=e,
            )
            return None

    def close(self):
        self.ws.close()

class ChatUser(User):
    wait_time = between(1, 5)
    host = "ws://localhost:8083"

    def on_start(self):
        self.client = WebSocketClient(self.host)

    @task
    def send_message(self):
        message = json.dumps({"content": "Test message"})
        self.client.send(message)
        response = self.client.receive()
        if response:
            print(f"Received: {response}")

    def on_stop(self):
        self.client.close()
