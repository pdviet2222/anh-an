from pymongo import MongoClient, ASCENDING, DESCENDING

db = None


def init_db(mongo_uri):
    global db
    client = MongoClient(mongo_uri)
    db = client.get_database()
    ensure_indexes()
    return db


def ensure_indexes():
    if db is None:
        return

    db.users.create_index([('username', ASCENDING)], unique=True)
    db.users.create_index([('email', ASCENDING)], unique=True)

    db.lands.create_index([('status', ASCENDING), ('created_at', DESCENDING)])
    db.lands.create_index([('price', ASCENDING)])
    db.lands.create_index([('area', ASCENDING)])

    db.transactions.create_index([('land_id', ASCENDING), ('date', DESCENDING)])
    db.transactions.create_index([('status', ASCENDING), ('date', DESCENDING)])
    db.transactions.create_index([('type', ASCENDING), ('date', DESCENDING)])