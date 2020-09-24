from pymongo import MongoClient
import json

client = MongoClient("")#uri here
db = client.logs.traces
f = open("testwalk.json", "w+")
f.write(json.dumps(db.find_one({"_id":"placeholderiptx"})))
f.close()