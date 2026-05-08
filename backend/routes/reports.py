from flask import Blueprint, jsonify
from extensions import db

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/stats', methods=['GET'])
def get_stats():
    total_lands = db.lands.count_documents({})
    available_lands = db.lands.count_documents({"status": "available"})
    sold_lands = db.lands.count_documents({"status": "sold"})
    
    # Simple aggregation for total revenue
    pipeline = [
        {"$group": {"_id": None, "total_revenue": {"$sum": "$amount"}}}
    ]
    revenue_result = list(db.transactions.aggregate(pipeline))
    total_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0
    
    return jsonify({
        "total_lands": total_lands,
        "available_lands": available_lands,
        "sold_lands": sold_lands,
        "total_revenue": total_revenue
    }), 200
