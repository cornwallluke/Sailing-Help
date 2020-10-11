import json
import matplotlib.pyplot as plt
with open("out/first.json") as f:
    data = json.loads(f.read())
filtered = list(filter(lambda x:x["frame_type"]=="data_message" and x["name"]=="record", data))
mine = [{"lat":i["fields"][1]["value"], 
        "long":i["fields"][1]["value"], 
        "time":i["fields"][0]["raw_value"], 
        "acc":0,
        } for i in filtered]
a = open("firstrip.json", "w+")
a.write(json.dumps(mine))
a.close()