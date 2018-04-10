# MMM-BMP-sensor

Magic mirror barometer module based on Adafruit BMP sensor.

<p align="center">
    <img src="images/mmm-bpm-sensor-demo.png">
</p>

## Installation

Install the python lib
```bash
git clone https://github.com/adafruit/Adafruit_Python_BMP
cd Adafruit_Python_BMP
sudo python setup.py install
```

Install this module by cloning it into your Magic Mirror module directory
```
cd modules
git clone https://github.com/Sispheor/MMM-BMP-sensor.git
cd MMM-BMP-sensor
npm install
```

Configure your `~/MagicMirror/config/config.js`:
```
{
    module: "MMM-BMP-sensor",
    header: "Barometer",
    position: "top_left",
    config: {
        showPressureRow: false,
        temperatureUnit: "metric",
        timeLimitKeepBmpData: "8h",
        updateInterval: "1h"
    }
}
```


## Configuration options

| Option                  | Default | Description                                                                                                                          |
|-------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------|
| updateInterval          | 1h      | Interval before the module try to get a new value from the sensor. Each new value are placed in the database and the view is updated |
| timeLimitKeepBmpData    | 6h      | Cleanup database from old value after this interval. By default the module keep 6 hours of data.                                     |
| debug                   | false   | If True, debug print are displayed in the console                                                                                    |
| showTableBmpInfo        | true    | If true, the table that contains info about temparature, altitude, seal level pressure and pressure will be displayed on the screen  |
| showTemperatureRow      | true    | If true, the line that concerns the temperature will be displayed in the info table                                                  |
| showAltitudeRow         | true    | If true, the line that concerns the altitude will be displayed in the info table                                                     |
| showSeaLevelPressureRow | true    | If true, the line that concerns the altitude will be displayed in the info table                                                     |
| showPressureRow         | true    | If true, the line that concerns the current pressure will be displayed in the info table                                             |
| showGauge               | true    | Display or not the pressure gauge                                                                                                    |
| showChart               | true    | Display or not the chart with all data bellow the timeLimitKeepBmpData                                                               |
| chartTimeUnit           | hour    | Unit of the chart. Can be millisecond, second, minute, hour, day, week, month, quarter, year                                         |
| temperatureUnit         | metric  | metric = Celsius, imperial =Fahrenheit                                                                                               |

`updateInterval` is composed by an integer followed by a letter "s" or "m" or "h" or "d"

Example of `updateInterval`:
- **1h**: get new barometer metrics every hour
- **4h**: get new barometer metrics every 4 hours
- **30m**: get new barometer metrics every 30 minutes



