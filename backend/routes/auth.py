from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import datetime
from config import Config
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return jsonify({"error": "Missing required fields"}), 400

    if db.users.find_one({"username": username}):
        return jsonify({"error": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user_id = db.users.insert_one({
        "username": username,
        "password": hashed_password,
        "email": email,
        "role": "user",
        "created_at": datetime.datetime.utcnow()
    }).inserted_id

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.users.find_one({"username": username})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'username': user['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)

        return jsonify({
            "token": token,
            "user": {
                "username": user['username'],
                "email": user['email'],
                "role": user['role']
            }
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401
