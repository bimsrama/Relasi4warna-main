# packages/emergentintegrations/llm/chat.py

class UserMessage:
    def __init__(self, text):
        self.text = text

class LlmChat:
    def __init__(self, api_key=None, session_id=None, system_message=None):
        self.api_key = api_key
        self.session_id = session_id
        self.system_message = system_message
        self.model = "gpt-3.5-turbo"

    def with_model(self, provider, model):
        self.model = model
        return self

    async def send_message(self, message):
        # Ini adalah respon palsu sementara agar server tidak crash
        # Nanti Anda bisa ganti dengan logika AI yang asli
        return f"[MOCK RESPONSE] Sistem AI sedang dalam perbaikan. Pesan Anda: {message.text}"
