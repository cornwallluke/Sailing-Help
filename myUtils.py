import matplotlib.pyplot as plt
import numpy as np
def convexHullBlind(points):
    start = min(zip([i for i in len(points)],points), key=lambda x:x[1][1])

x,y = zip(*[[0,0],[0,1],[1,1],[1,0]])
plt.figure(figsize = (8, 8))
plt.axis("equal")
plt.fill(x, y)
plt.show()