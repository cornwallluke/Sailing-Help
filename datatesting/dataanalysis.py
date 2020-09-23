import json
import numpy as np
import matplotlib.pyplot as plt
f = open("testwalk.json", "r")
data = json.loads(f.read())
f.close()
accels = np.asarray(list(map(lambda x:list(map(float, x)), data["accel"])))
pos = np.asarray([[float(i["lat"]),float(i["long"])] for i in data["trace"]])
# print(sum(map(float, data["accel"][0])))
# print(sum(map(float, data["accel"][1])))
# print(sum(map(float, data["accel"][2])))
print(sum(accels[:,2])/len(accels))
plt.scatter(pos[:,0], pos[:,1])
plt.show()