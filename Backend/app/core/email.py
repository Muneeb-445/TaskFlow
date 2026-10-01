import smtplib
from email.message import EmailMessage

from app.core.config import settings


class EmailService:
    def __init__(self) -> None:
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME

    def send_email(
        self,
        recipient_email: str,
        subject: str,
        body: str,
    ) -> None:

        message = EmailMessage()

        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = recipient_email
        message["Subject"] = subject

        message.set_content(body)

        with smtplib.SMTP(self.host, self.port) as server:
            server.starttls()
            server.login(self.username, self.password)
            server.send_message(message)


email_service = EmailService()