from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from extensions import db
import datetime

lands_bp = Blueprint('lands', __name__)

@lands_bp.route('/', methods=['GET'])
def get_lands():
    lands = list(db.lands.find())
    for land in lands:
        land['_id'] = str(land['_id'])
    return jsonify(lands), 200

@lands_bp.route('/<id>', methods=['GET'])
def get_land(id):
    land = db.lands.find_one({"_id": ObjectId(id)})
    if land:
        land['_id'] = str(land['_id'])
        return jsonify(land), 200
    return jsonify({"error": "Land not found"}), 404

@lands_bp.route('/', methods=['POST'])
def create_land():
    data = request.get_json()
    new_land = {
        "title": data.get('title'),
        "description": data.get('description'),
        "location": data.get('location'), # {lat, lng}
        "area": data.get('area'),
        "price": data.get('price'),
        "status": data.get('status', 'available'),
        "created_at": datetime.datetime.utcnow()
    }
    result = db.lands.insert_one(new_land)
    new_land['_id'] = str(result.inserted_id)
    return jsonify(new_land), 201

@lands_bp.route('/<id>', methods=['PUT'])
def update_land(id):
    data = request.get_json()
    db.lands.update_one({"_id": ObjectId(id)}, {"$set": data})
    return jsonify({"message": "Land updated successfully"}), 200

@lands_bp.route('/<id>', methods=['DELETE'])
def delete_land(id):
    db.lands.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Land deleted successfully"}), 200
