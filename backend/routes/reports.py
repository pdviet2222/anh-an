from flask import Blueprint, jsonify
from extensions import db
import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/stats', methods=['GET'])
def get_stats():
    total_lands = db.lands.count_documents({})
    available_lands = db.lands.count_documents({"status": "available"})
    sold_lands = db.lands.count_documents({"status": "sold"})
    pending_lands = db.lands.count_documents({"status": "pending"})
    
    # Simple aggregation for total revenue
    pipeline = [
        {"$group": {"_id": None, "total_revenue": {"$sum": "$amount"}}}
    ]
    revenue_result = list(db.transactions.aggregate(pipeline))
    total_revenue = revenue_result[0]['total_revenue'] if revenue_result else 0

    monthly_pipeline = [
        {
            "$match": {
                "date": {
                    "$gte": datetime.datetime.utcnow() - datetime.timedelta(days=180)
                },
                "status": "completed"
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date"},
                    "month": {"$month": "$date"}
                },
                "revenue": {"$sum": "$amount"},
                "transactions": {"$sum": 1}
            }
        },
        {
            "$sort": {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ]
    monthly_stats_raw = list(db.transactions.aggregate(monthly_pipeline))
    monthly_stats = [
        {
            "name": f"{item['_id']['year']}-{item['_id']['month']:02d}",
            "revenue": item.get('revenue', 0),
            "transactions": item.get('transactions', 0)
        }
        for item in monthly_stats_raw
    ]

    recent_pipeline = [
        {"$sort": {"date": -1}},
        {"$limit": 5},
        {
            "$lookup": {
                "from": "lands",
                "localField": "land_id",
                "foreignField": "_id",
                "as": "land"
            }
        },
        {
            "$unwind": {
                "path": "$land",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$project": {
                "_id": 1,
                "amount": 1,
                "status": 1,
                "type": 1,
                "buyer_name": 1,
                "date": 1,
                "land_title": "$land.title",
                "land_location": "$land.location"
            }
        }
    ]
    recent_transactions = []
    for tx in db.transactions.aggregate(recent_pipeline):
        tx['_id'] = str(tx['_id'])
        if isinstance(tx.get('date'), datetime.datetime):
            tx['date'] = tx['date'].isoformat()
        recent_transactions.append(tx)

    completed_transactions = db.transactions.count_documents({"status": "completed"})
    pending_transactions = db.transactions.count_documents({"status": "pending"})
    
    return jsonify({
        "total_lands": total_lands,
        "available_lands": available_lands,
        "sold_lands": sold_lands,
        "pending_lands": pending_lands,
        "total_revenue": total_revenue,
        "completed_transactions": completed_transactions,
        "pending_transactions": pending_transactions,
        "monthly_stats": monthly_stats,
        "recent_transactions": recent_transactions
    }), 200
