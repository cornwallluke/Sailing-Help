from pymongo import MongoClient
import json
import math
client = MongoClient("")#uri here
db = client.logs.traces
def latlongdist(lat1, lon1, lat2, lon2) :
  dy = (lat2-lat1)*math.pi/180*6.371e6;
  dx = (lon2-lon1)*math.pi/180*math.sin((90-lat1)*math.pi/180)*6.371e6;
  return dx, dy;

def distlatlong(lat1, lon1, dy, dx):#fix deg-rad you idiot
  lat2 = lat1+dy/6.371e6;
  lon2 = lon1+dx/(math.sin((90-lat1)*math.pi/180)*6.371e6);
  return lat2, lon2;
with open("out/windsurf.json") as f:
    data = json.loads(f.read())

filtered = list(filter(lambda x:x["frame_type"]=="data_message" and x["name"]=="record" and x["fields"][1]["value"] is not None and x["fields"][1]["name"] == "position_lat", data))
# print(data)
origin = (filtered[0]["fields"][1]["value"], filtered[0]["fields"][2]["value"])
mine = [{"lat":i["fields"][1]["value"], 
        "long":i["fields"][2]["value"], 
        "time":i["fields"][0]["raw_value"]+631065600, 
        "head":0,
        "roll":0,
        "pitch":0,
        "dx":latlongdist(origin[0], origin[1], i["fields"][1]["value"], i["fields"][2]["value"])[0],
        "dy":latlongdist(origin[0], origin[1], i["fields"][1]["value"], i["fields"][2]["value"])[1],
        "acc":0,
        } for i in filtered]

db.update_one({"_id":"windsurf"},{"$set":{
                "trace":mine,
                }})