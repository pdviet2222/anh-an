from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from extensions import db
import datetime

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
def get_transactions():
    transactions = list(db.transactions.find())
    for t in transactions:
        t['_id'] = str(t['_id'])
        t['land_id'] = str(t['land_id'])
    return jsonify(transactions), 200

@transactions_bp.route('/', methods=['POST'])
def create_transaction():
    data = request.get_json()
    new_transaction = {
        "land_id": ObjectId(data.get('land_id')),
        "user_id": data.get('user_id'), # String or ObjectId
        "amount": data.get('amount'),
        "type": data.get('type', 'sale'), # sale, lease
        "date": datetime.datetime.utcnow()
    }
    
    # Update land status if it's a sale
    if new_transaction['type'] == 'sale':
        db.lands.update_one({"_id": new_transaction['land_id']}, {"$set": {"status": "sold"}})
        
    result = db.transactions.insert_one(new_transaction)
    new_transaction['_id'] = str(result.inserted_id)
    new_transaction['land_id'] = str(new_transaction['land_id'])
    
    return jsonify(new_transaction), 201
