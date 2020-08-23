class fluidGrid:
    def __init__(self, density, speed, direction):
        self.density = density
        self.speed = speed
        self.direction = direction

class boat:
    def __init__(self, fluid1, boardarea, fluid2, sailarea):
        self.water = fluid1
        self.wind = fluid2
        self.dagger = boardarea
        self.sail = sailarea
        self.heading = (0,0,0)

if __name__ == "__main__":
    water = fluidGrid(1000, 0, 0)
    wind = fluidGrid(1.225, 10, 0)
    laser = boat(water, 0.3, wind,7.06)
