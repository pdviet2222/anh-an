from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
import os
from extensions import init_db

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

db = init_db(app.config['MONGO_URI'])

# Import and register blueprints
from routes.auth import auth_bp
from routes.lands import lands_bp
from routes.transactions import transactions_bp
from routes.reports import reports_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(lands_bp, url_prefix='/api/lands')
app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
app.register_blueprint(reports_bp, url_prefix='/api/reports')

@app.route('/')
def index():
    return jsonify({"message": "Land Management System API is running"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
