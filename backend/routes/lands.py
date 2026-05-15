from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from bson.errors import InvalidId
from extensions import db
import datetime
import math

lands_bp = Blueprint('lands', __name__)

DEFAULT_PAGE = 1
DEFAULT_LIMIT = 10
MAX_LIMIT = 100
ALLOWED_STATUSES = {'available', 'sold', 'pending'}
ALLOWED_SORT_FIELDS = {'created_at', 'price', 'area', 'title', 'status'}


def serialize_land(land):
    land['_id'] = str(land['_id'])
    if isinstance(land.get('created_at'), datetime.datetime):
        land['created_at'] = land['created_at'].isoformat()
    if isinstance(land.get('updated_at'), datetime.datetime):
        land['updated_at'] = land['updated_at'].isoformat()
    return land


def parse_positive_number(raw_value, field_name, allow_zero=True):
    if raw_value is None:
        return None, None
    try:
        value = float(raw_value)
    except (TypeError, ValueError):
        return None, f"{field_name} must be a number"
    if allow_zero and value < 0:
        return None, f"{field_name} must be >= 0"
    if not allow_zero and value <= 0:
        return None, f"{field_name} must be > 0"
    return value, None


def normalize_location(location):
    if location is None:
        return None, None

    if isinstance(location, str):
        location = location.strip()
        return (location or None), None

    if isinstance(location, dict):
        lat = location.get('lat')
        lng = location.get('lng')
        if lat is None or lng is None:
            return None, "location object must include lat and lng"
        try:
            lat = float(lat)
            lng = float(lng)
        except (TypeError, ValueError):
            return None, "location.lat and location.lng must be numbers"
        return {'lat': lat, 'lng': lng}, None

    return None, "location must be either string or object"

@lands_bp.route('/', methods=['GET'])
def get_lands():
    page = max(int(request.args.get('page', DEFAULT_PAGE)), 1)
    limit = min(max(int(request.args.get('limit', DEFAULT_LIMIT)), 1), MAX_LIMIT)
    skip = (page - 1) * limit

    query = {}
    status = request.args.get('status')
    if status:
        if status not in ALLOWED_STATUSES:
            return jsonify({"error": "Invalid status filter"}), 400
        query['status'] = status

    search_term = request.args.get('q', '').strip()
    if search_term:
        query['$or'] = [
            {'title': {'$regex': search_term, '$options': 'i'}},
            {'description': {'$regex': search_term, '$options': 'i'}},
            {'location': {'$regex': search_term, '$options': 'i'}},
        ]

    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    min_area = request.args.get('min_area')
    max_area = request.args.get('max_area')

    price_filter = {}
    if min_price is not None:
        value, error = parse_positive_number(min_price, 'min_price')
        if error:
            return jsonify({"error": error}), 400
        price_filter['$gte'] = value
    if max_price is not None:
        value, error = parse_positive_number(max_price, 'max_price')
        if error:
            return jsonify({"error": error}), 400
        price_filter['$lte'] = value
    if price_filter:
        query['price'] = price_filter

    area_filter = {}
    if min_area is not None:
        value, error = parse_positive_number(min_area, 'min_area')
        if error:
            return jsonify({"error": error}), 400
        area_filter['$gte'] = value
    if max_area is not None:
        value, error = parse_positive_number(max_area, 'max_area')
        if error:
            return jsonify({"error": error}), 400
        area_filter['$lte'] = value
    if area_filter:
        query['area'] = area_filter

    sort_by = request.args.get('sort_by', 'created_at')
    if sort_by not in ALLOWED_SORT_FIELDS:
        return jsonify({"error": "Invalid sort field"}), 400
    sort_dir = -1 if request.args.get('sort_dir', 'desc').lower() == 'desc' else 1

    total = db.lands.count_documents(query)
    lands = list(
        db.lands.find(query)
        .sort(sort_by, sort_dir)
        .skip(skip)
        .limit(limit)
    )

    return jsonify({
        'items': [serialize_land(land) for land in lands],
        'pagination': {
            'page': page,
            'limit': limit,
            'total': total,
            'total_pages': math.ceil(total / limit) if total else 0,
        }
    }), 200

@lands_bp.route('/<id>', methods=['GET'])
def get_land(id):
    try:
        land = db.lands.find_one({"_id": ObjectId(id)})
    except InvalidId:
        return jsonify({"error": "Invalid land id"}), 400

    if land:
        return jsonify(serialize_land(land)), 200
    return jsonify({"error": "Land not found"}), 404

@lands_bp.route('/', methods=['POST'])
def create_land():
    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    area, area_error = parse_positive_number(data.get('area'), 'area', allow_zero=False)
    if area_error:
        return jsonify({"error": area_error}), 400

    price, price_error = parse_positive_number(data.get('price'), 'price')
    if price_error:
        return jsonify({"error": price_error}), 400

    status = data.get('status', 'available')
    if status not in ALLOWED_STATUSES:
        return jsonify({"error": "Invalid status"}), 400

    location, location_error = normalize_location(data.get('location'))
    if location_error:
        return jsonify({"error": location_error}), 400

    now = datetime.datetime.utcnow()
    new_land = {
        "title": title,
        "description": (data.get('description') or '').strip(),
        "location": location,
        "area": area,
        "price": price,
        "status": status,
        "created_at": now,
        "updated_at": now,
    }
    result = db.lands.insert_one(new_land)
    created = db.lands.find_one({"_id": result.inserted_id})
    return jsonify(serialize_land(created)), 201

@lands_bp.route('/<id>', methods=['PUT'])
def update_land(id):
    data = request.get_json() or {}
    update_data = {}

    if 'title' in data:
        title = (data.get('title') or '').strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        update_data['title'] = title

    if 'description' in data:
        update_data['description'] = (data.get('description') or '').strip()

    if 'status' in data:
        status = data.get('status')
        if status not in ALLOWED_STATUSES:
            return jsonify({"error": "Invalid status"}), 400
        update_data['status'] = status

    if 'area' in data:
        area, area_error = parse_positive_number(data.get('area'), 'area', allow_zero=False)
        if area_error:
            return jsonify({"error": area_error}), 400
        update_data['area'] = area

    if 'price' in data:
        price, price_error = parse_positive_number(data.get('price'), 'price')
        if price_error:
            return jsonify({"error": price_error}), 400
        update_data['price'] = price

    if 'location' in data:
        location, location_error = normalize_location(data.get('location'))
        if location_error:
            return jsonify({"error": location_error}), 400
        update_data['location'] = location

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    update_data['updated_at'] = datetime.datetime.utcnow()

    try:
        result = db.lands.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    except InvalidId:
        return jsonify({"error": "Invalid land id"}), 400

    if result.matched_count == 0:
        return jsonify({"error": "Land not found"}), 404

    updated = db.lands.find_one({"_id": ObjectId(id)})
    return jsonify(serialize_land(updated)), 200

@lands_bp.route('/<id>', methods=['DELETE'])
def delete_land(id):
    try:
        land_id = ObjectId(id)
    except InvalidId:
        return jsonify({"error": "Invalid land id"}), 400

    transaction_exists = db.transactions.count_documents({"land_id": land_id}, limit=1) > 0
    if transaction_exists:
        return jsonify({"error": "Cannot delete land with existing transactions"}), 409

    result = db.lands.delete_one({"_id": land_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Land not found"}), 404

    return jsonify({"message": "Land deleted successfully"}), 200
