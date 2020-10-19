import html
import os
import sys
from pymongo import MongoClient
from flask import Flask, render_template, request, session, jsonify
import json
import numpy as np

from data_tools import edgelinker, latlongdist

app = Flask(__name__)
app.secret = os.environ.get('secret')
print(app.secret)

mongoclient = MongoClient(os.environ.get("mongouri"))
db = mongoclient.logs.traces

@app.route("/")
def index():
  return render_template("index.html")

@app.route("/query", methods=["GET"])
def getroute():
  # print(request)
  tripid = request.args.get("key")
  print(tripid)
  try:
    trip = db.find_one({"_id":tripid})
  except:
    return "trip probably doesn't exist", 400

  
  processed = []
  # print(trip)
  # print()
  if len(trip["trace"])>0:
    processed = edgelinker([{"lat":i["lat"],
                            "long":i["long"],
                            "acc":i["acc"],
                            "time":i["time"],
                            "head":i["head"],
                            "roll":i["roll"],
                            "pitch":i["pitch"],
                            "dx":latlongdist(float(trip["trace"][0]["lat"]), float(trip["trace"][0]["long"]), float(i["lat"]), float(i["long"]))[0],
                            "dy":latlongdist(float(trip["trace"][0]["lat"]), float(trip["trace"][0]["long"]), float(i["lat"]), float(i["long"]))[1]} for i in trip["trace"]], 1)
  return jsonify(processed)

@app.route("/trip", methods = ["GET"])
def gettrip():
  return jsonify({"todo":"todo"})  


if __name__ == '__main__':
    app.run(host='0.0.0.0')