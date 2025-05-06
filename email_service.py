import os
from flask import url_for
from flask_mail import Mail, Message
import logging
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

# Configura logging dettagliato
logging.basicConfig(level=logging.DEBUG)

class EmailService:
    def __init__(self):
        self.mail = None
        self.serializer = None
        self.security_password_salt = None

    def init_app(self, app):
        app.config.setdefault('MAIL_SERVER', 'smtp.gmail.com')
        app.config.setdefault('MAIL_PORT', 587)
        app.config.setdefault('MAIL_USE_TLS', True)
        app.config.setdefault('MAIL_USERNAME', os.environ.get('EMAIL_USER', 'wikisportcars@gmail.com'))
        app.config.setdefault('MAIL_PASSWORD', os.environ.get('EMAIL_PASSWORD', 'jwcy xkmh pgsi zbug'))
        app.config.setdefault('MAIL_DEFAULT_SENDER', os.environ.get('EMAIL_USER', 'wikisportcars@gmail.com'))

        self.mail = Mail(app)
        self.serializer = URLSafeTimedSerializer(app.secret_key)
        self.security_password_salt = app.config['SECURITY_PASSWORD_SALT']

    def _generate_token(self, email):
        return self.serializer.dumps(email, salt=self.security_password_salt)

    def confirm_token(self, token, expiration=3600):
        try:
            email = self.serializer.loads(token, salt=self.security_password_salt, max_age=expiration)
            return email
        except (SignatureExpired, BadSignature):
            return None

    def send_confirmation_email(self, email):
        token = self._generate_token(email)
        confirm_url = f"http://localhost:5000/confirm/{token}"
        
        subject = "Conferma la tua email - WikiSportCars"
        body = f"""
        <p>Benvenuto in WikiSportCars!</p>
        <p>Per confermare il tuo account, clicca sul seguente link:</p>
        <p><a href="{confirm_url}">Conferma il tuo account</a></p>
        <p>Se non hai richiesto la registrazione su WikiSportCars, ignora questa email.</p>
        <p>Saluti,<br>Il team di WikiSportCars</p>
        """
        
        msg = Message(subject=subject, recipients=[email], html=body)
        self.mail.send(msg)

    def send_password_reset_email(self, email):
        token = self._generate_token(email)
        reset_url = f"http://localhost:5000/reset_password/{token}"
        
        subject = "Recupero Password - WikiSportCars"
        body = f"""
        <p>Hai richiesto il recupero della tua password su WikiSportCars.</p>
        <p>Per reimpostare la tua password, clicca sul seguente link:</p>
        <p><a href="{reset_url}">Reimposta la tua password</a></p>
        <p>Se non hai richiesto il recupero della password, ignora questa email.</p>
        <p>Saluti,<br>Il team di WikiSportCars</p>
        """
        
        msg = Message(subject=subject, recipients=[email], html=body)
        self.mail.send(msg)

email_service = EmailService()