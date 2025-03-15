from locust import HttpUser, task, between, events

class ChatCacheUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def get_chat_history(self):
        self.client.get("/api/chat/history?limit=50")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("Cache test started")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("Cache test stopped")

