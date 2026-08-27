from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from auth import auth_bp
from expenses import expenses_bp

app = Flask(__name__)

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'
app.config['JWT_SECRET_KEY'] = 'change-this-secret-key-later'

# Init extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app)
app.register_blueprint(auth_bp)
app.register_blueprint(expenses_bp)

@app.route('/')
def home():
    return {"message": "Home Expense Tracker API is running!"}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()   # creates the .db file and tables
    app.run(debug=True)