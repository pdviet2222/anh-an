from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from bson.errors import InvalidId
from extensions import db
import datetime
import math

transactions_bp = Blueprint('transactions', __name__)

DEFAULT_PAGE = 1
DEFAULT_LIMIT = 10
MAX_LIMIT = 100
ALLOWED_TYPES = {'sale', 'lease'}
ALLOWED_STATUSES = {'pending', 'completed', 'cancelled'}


def serialize_transaction(transaction):
    transaction['_id'] = str(transaction['_id'])
    if isinstance(transaction.get('land_id'), ObjectId):
        transaction['land_id'] = str(transaction['land_id'])
    if isinstance(transaction.get('date'), datetime.datetime):
        transaction['date'] = transaction['date'].isoformat()
    if isinstance(transaction.get('created_at'), datetime.datetime):
        transaction['created_at'] = transaction['created_at'].isoformat()
    if isinstance(transaction.get('updated_at'), datetime.datetime):
        transaction['updated_at'] = transaction['updated_at'].isoformat()
    return transaction


def parse_amount(raw_value):
    try:
        amount = float(raw_value)
    except (TypeError, ValueError):
        return None, "amount must be a number"
    if amount < 0:
        return None, "amount must be >= 0"
    return amount, None

@transactions_bp.route('/', methods=['GET'])
def get_transactions():
    page = max(int(request.args.get('page', DEFAULT_PAGE)), 1)
    limit = min(max(int(request.args.get('limit', DEFAULT_LIMIT)), 1), MAX_LIMIT)
    skip = (page - 1) * limit

    query = {}
    status = request.args.get('status')
    if status:
        if status not in ALLOWED_STATUSES:
            return jsonify({"error": "Invalid status filter"}), 400
        query['status'] = status

    tx_type = request.args.get('type')
    if tx_type:
        if tx_type not in ALLOWED_TYPES:
            return jsonify({"error": "Invalid transaction type filter"}), 400
        query['type'] = tx_type

    search_term = request.args.get('q', '').strip()
    if search_term:
        query['$or'] = [
            {'buyer_name': {'$regex': search_term, '$options': 'i'}},
            {'notes': {'$regex': search_term, '$options': 'i'}},
        ]

    total = db.transactions.count_documents(query)

    pipeline = [
        {'$match': query},
        {'$sort': {'date': -1}},
        {'$skip': skip},
        {'$limit': limit},
        {
            '$lookup': {
                'from': 'lands',
                'localField': 'land_id',
                'foreignField': '_id',
                'as': 'land'
            }
        },
        {
            '$unwind': {
                'path': '$land',
                'preserveNullAndEmptyArrays': True
            }
        },
        {
            '$project': {
                '_id': 1,
                'land_id': 1,
                'user_id': 1,
                'buyer_name': 1,
                'amount': 1,
                'type': 1,
                'status': 1,
                'notes': 1,
                'date': 1,
                'created_at': 1,
                'updated_at': 1,
                'land_title': '$land.title',
                'land_location': '$land.location'
            }
        }
    ]
    transactions = list(db.transactions.aggregate(pipeline))

    return jsonify({
        'items': [serialize_transaction(tx) for tx in transactions],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'total_pages': math.ceil(total / limit) if total else 0,
        }
    }), 200

@transactions_bp.route('/', methods=['POST'])
def create_transaction():
    data = request.get_json() or {}

    land_id_raw = data.get('land_id')
    if not land_id_raw:
        return jsonify({"error": "land_id is required"}), 400

    try:
        land_id = ObjectId(land_id_raw)
    except InvalidId:
        return jsonify({"error": "Invalid land_id"}), 400

    land = db.lands.find_one({'_id': land_id})
    if not land:
        return jsonify({"error": "Land not found"}), 404

    amount, amount_error = parse_amount(data.get('amount'))
    if amount_error:
        return jsonify({"error": amount_error}), 400

    tx_type = data.get('type', 'sale')
    if tx_type not in ALLOWED_TYPES:
        return jsonify({"error": "Invalid transaction type"}), 400

    tx_status = data.get('status', 'completed')
    if tx_status not in ALLOWED_STATUSES:
        return jsonify({"error": "Invalid transaction status"}), 400

    if tx_type == 'sale' and tx_status == 'completed' and land.get('status') == 'sold':
        return jsonify({"error": "Land is already sold"}), 409

    now = datetime.datetime.utcnow()
    new_transaction = {
        "land_id": land_id,
        "user_id": data.get('user_id'),
        "buyer_name": (data.get('buyer_name') or '').strip() or None,
        "amount": amount,
        "type": tx_type,
        "status": tx_status,
        "notes": (data.get('notes') or '').strip() or None,
        "date": now,
        "created_at": now,
        "updated_at": now,
    }

    if tx_type == 'sale' and tx_status == 'completed':
        db.lands.update_one({"_id": land_id}, {"$set": {"status": "sold", "updated_at": now}})
    elif tx_type == 'lease' and tx_status == 'completed' and land.get('status') == 'available':
        db.lands.update_one({"_id": land_id}, {"$set": {"status": "pending", "updated_at": now}})

    result = db.transactions.insert_one(new_transaction)
    created = db.transactions.find_one({"_id": result.inserted_id})
    return jsonify(serialize_transaction(created)), 201
