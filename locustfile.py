from locust import HttpUser, task, between
import json

class SuperLearningUser(HttpUser):
    wait_time = between(1, 5)

    @task(3)
    def view_landing(self):
        self.client.get("/")

    @task(2)
    def view_dashboard(self):
        self.client.get("/dashboard")
        self.client.get("/static/style.css") # Static assets

    @task(1)
    def generate_notes(self):
        # Simulate note generation
        payload = {
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "video_type": "stanford"
        }
        headers = {"Content-Type": "application/json"}
        with self.client.post("/generate", json=payload, headers=headers, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed to generate notes: {response.status_code}")

    @task(2)
    def study_chat(self):
        # Simulate chat interaction (mocked backend will respond fast)
        payload = {
            "message": "What is a transformer?",
            "agent_type": "study"
        }
        headers = {"Content-Type": "application/json"}
        self.client.post("/api/v1/agents/chat", json=payload, headers=headers)

