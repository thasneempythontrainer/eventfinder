"""Email backend that always fails, to prove send failures are recorded."""


class BrokenEmailBackend:
    def __init__(self, *args, **kwargs):
        pass

    def open(self):
        return False

    def close(self):
        pass

    def send_messages(self, email_messages):
        raise OSError("simulated SMTP connection failure")
