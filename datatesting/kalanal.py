import json
import numpy as np
import matplotlib.pyplot as plt
f = open("coopwalk.json", "r")
data = json.loads(f.read())
print(data)
f.close()
poskal = np.asarray([[float(i[0]),float(i[1])] for i in data["trace"]])
posnon = np.asarray([[float(i[2]),float(i[3])] for i in data["trace"]])
# print(sum(map(float, data["accel"][0])))
# print(sum(map(float, data["accel"][1])))
# print(sum(map(float, data["accel"][2])))
# v = np.ndarray(accels.shape)
# ap = np.ndarray(accels.shape)
# for i in range(1,accels.shape[0]):
#     v[i] = v[i-1]+accels[i]*0.000016666
# v = np.apply_along_axis(lambda row:(row-np.mean(row))/(np.max(row)-np.min(row)),0, v)

# for i in range(1,v.shape[0]):
#     ap[i]=ap[i-1]+v[i]
# ap = np.apply_along_axis(lambda row:(row-np.mean(row))/(np.max(row)-np.min(row)),0, ap)
# pos = np.apply_along_axis(lambda row:(row-np.mean(row))/(np.max(row)-np.min(row)),0, pos)
# print(sum(accels[:,2])/len(accels))
# for i in range():

fig = plt.figure()
ax = fig.add_subplot(111)

ax.scatter(poskal[:,0], poskal[:,1])
ax.scatter(posnon[:,0], posnon[:,1])
plt.show()