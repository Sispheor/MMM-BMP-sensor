import json

import Adafruit_BMP.BMP085 as BMP085

sensor = BMP085.BMP085()

returned_dict = {
    "temperature": "{0:0.2f}".format(sensor.read_temperature()),
    "pressure": "{0:0.2f}".format(sensor.read_pressure()),
    "altitude": "{0:0.2f}".format(sensor.read_altitude()),
    "sealevel_pressure": "{0:0.2f}".format(sensor.read_sealevel_pressure())

}

print(json.dumps(returned_dict))
