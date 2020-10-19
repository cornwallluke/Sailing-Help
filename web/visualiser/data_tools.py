import numpy as np
import math
def edgelinkerold(listy, threshold=0.1):
    if len(listy)<3:
        return [listy]
    start, end = np.asarray([listy[0]["dx"],listy[0]["dy"]]), np.asarray([listy[-1]["dx"],listy[-1]["dy"]])

    #find a point that does not lie on the line between the points start and end
    #we probably want to start halfway between and work out to get higher quality ones or just find the furthest one lol
    maxi = None
    maxim = -1
    # line = ((start["dy"]-end["dy"])/(start["dx"]-end["dx"]),)
    for i in range(2, len(listy)-2):

        point = np.asarray([listy[i]["dx"], listy[i]["dy"]])
        dist = abs(np.cross(point-start, end-start)/np.linalg.norm(start-end))
        # print(dist)
        if dist > maxim:
            maxim = dist
            maxi = i
    if maxim > threshold * np.linalg.norm(start-end):
        # print(maxim)
        before = listy[:maxi]
        after = listy[maxi:]
        return edgelinker(before, threshold) + edgelinker(after, threshold)
    else:
        # print(len(listy), maxim,threshold * np.linalg.norm(start-end), threshold)
        return [listy]
def angleto(pointa, pointb):
    if pointa["dx"]==pointb["dx"]:
        return math.pi if pointa["dy"]>pointb["dy"] else 0
    return -math.atan((pointa["dy"]-pointb["dy"])/(pointa["dx"]-pointb["dx"]))+math.pi/2+(math.pi if pointa["dx"]>pointb["dx"] else 0)
    # return (-math.atan((point1["dy"]-point["dy"])/(point1["dx"]-point["dx"]))+math.pi/2+ (math.pi if point["dx"]<point1["dx"] else 0)) if point1["dx"]!=point["dx"] else (math.pi if point1["dy"]<point["dy"] else 0)

def edgelinker(listy, threshold=0.1):
    if len(listy)<3:
        return [listy]
    # print(listy[0])
    # start, end = np.asarray([listy[0]["dx"],listy[0]["dy"]]), np.asarray([listy[-1]["dx"],listy[-1]["dy"]])
    #find a point that does not lie on the line between the points start and end
    #we probably want to start halfway between and work out to get higher quality ones or just find the furthest one lol
    lines = [listy[0:2]]
    lineno = 0
    i = 2
    while i < len(listy) -2:
        
        diff = abs(angleto(lines[lineno][0], lines[lineno][-1]) - angleto(lines[lineno][-1], listy[i]))
        
        if diff < min(threshold, math.pi*2-threshold):
            
            lines[lineno].append(listy[i])
            i+=1
        else:
            # print(diff)
            lines.append(listy[i:i+2])
            i+=2
            lineno+=1
            
            
    return lines
def latlongdist(lat1, lon1, lat2, lon2) :
  dy = (lat2-lat1)*math.pi/180*6.371e6;
  dx = (lon2-lon1)*math.pi/180*math.sin((90-lat1)*math.pi/180)*6.371e6;
  return dx, dy;

def distlatlong(lat1, lon1, dy, dx):#fix deg-rad you idiot
  lat2 = lat1+dy/6.371e6;
  lon2 = lon1+dx/(math.sin((90-lat1)*math.pi/180)*6.371e6);
  return lat2, lon2;