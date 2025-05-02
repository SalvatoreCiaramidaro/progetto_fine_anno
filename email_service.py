from flask import url_for
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired

mail = Mail()

class EmailService:
    def __init__(self, app=None):
        self.app = None
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        # Configura Flask-Mail
        app.config['MAIL_SERVER'] = 'smtp.gmail.com'
        app.config['MAIL_PORT'] = 465
        app.config['MAIL_USE_SSL'] = True
        app.config['MAIL_USERNAME'] = 'stefaniagitto71@gmail.com'
        app.config['MAIL_PASSWORD'] = 'gkry vbeu brft vuue'
        app.config['MAIL_DEFAULT_SENDER'] = 'wikisportcars@gmail.com'
        
        # Inizializza Flask-Mail
        mail.init_app(app)
        
        # Salva riferimenti per il token
        self.app = app

    def generate_confirmation_token(self, email):
        """
        Genera un token di conferma per l'email fornita
        """
        serializer = URLSafeTimedSerializer(self.app.secret_key)
        return serializer.dumps(email, salt=self.app.config['SECURITY_PASSWORD_SALT'])

    def confirm_token(self, token, expiration=3600):
        """
        Verifica un token e restituisce l'email associata se valido
        """
        serializer = URLSafeTimedSerializer(self.app.secret_key)
        try:
            email = serializer.loads(
                token,
                salt=self.app.config['SECURITY_PASSWORD_SALT'],
                max_age=expiration
            )
            return email
        except Exception as e:
            print(f"Errore nella conferma del token: {str(e)}")
            return None

    def send_confirmation_email(self, user_email):
        """
        Invia un'email di conferma all'utente
        """
        if not self.app:
            raise RuntimeError("Flask app non inizializzata per il servizio email")
            
        token = self.generate_confirmation_token(user_email)
        
        # Usa il percorso corretto che corrisponde al route nel server.py
        confirm_url = url_for('confirm_email', token=token, _external=True)
        
        html = f'''
        <h1>Conferma il tuo account WikiSportCars</h1>
        <p>Grazie per esserti registrato! Per confermare il tuo account, clicca sul link qui sotto:</p>
        <p><a href="{confirm_url}">Conferma il tuo account</a></p>
        <p>Il link sarà valido per un'ora.</p>
        <p>Se non sei stato tu a registrarti, ignora questa email.</p>
        '''
        
        msg = Message('Conferma il tuo account WikiSportCars', 
                     recipients=[user_email], 
                     html=html)
        try:
            mail.send(msg)
        except Exception as e:
            print(f"Errore nell'invio dell'email: {str(e)}")
            raise

# Istanza dell'oggetto per essere importato
email_service = EmailService()