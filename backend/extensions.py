from pymongo import MongoClient

db = None


def init_db(mongo_uri):
    global db
    client = MongoClient(mongo_uri)
    db = client.get_database()
    return db