import html
import os
import sys
from pymongo import MongoClient
from flask import Flask, render_template, request, session, jsonify
import json
import numpy as np


app = Flask(__name__)
app.secret = os.environ.get('secret')
print(app.secret)

mongoclient = MongoClient(os.environ.get("mongouri"))

@app.route("/")
def index():
  return "hello"

  


if __name__ == '__main__':
    app.run(host='0.0.0.0')