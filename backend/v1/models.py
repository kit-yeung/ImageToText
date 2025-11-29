from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

# Database table
class Users(db.Model):
    name = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class ExtractHistory(db.Model):
    user_name = db.Column(db.String(50), db.ForeignKey('users.name'), primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.now, primary_key=True)
    image_path = db.Column(db.String(255), nullable=False)
    extracted_text = db.Column(db.Text, nullable=False)
    text_type = db.Column(db.String(20), nullable=False)
    language = db.Column(db.String(20), nullable=False)

class TranslateHistory(db.Model):
    user_name = db.Column(db.String(50), db.ForeignKey('users.name'), primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.now, primary_key=True)
    input_text = db.Column(db.Text, nullable=False)
    translated_text = db.Column(db.Text, nullable=False)
    input_language = db.Column(db.String(20), nullable=False)
    output_language = db.Column(db.String(20), nullable=False)