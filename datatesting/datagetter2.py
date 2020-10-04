from pymongo import MongoClient
import json

client = MongoClient("")#uri here
db = client.logs.traces2
f = open("coopwalk.json", "w+")
f.write(json.dumps(db.find_one({"_id":"placeholderflat"})))
f.close()