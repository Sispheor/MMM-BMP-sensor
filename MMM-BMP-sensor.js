Module.register("MMM-BMP-sensor", {

    defaults: {
        updateInterval: "1h",
        timeLimitKeepBmpData: "6h",
        debug: false,
        showTableBmpInfo: true,
        showTemperatureRow: true,
        showAltitudeRow: true,
        showSeaLevelPressureRow: true,
        showPressureRow: true,
        showGauge: true,
        showChart: true,
        chartTimeUnit: "hour",
        temperatureUnit: "metric" // metric = Celsius, imperial =Fahrenheit
    },

    // empty database by default
    currentDatabase: [],

    start: function() {
        console.log("Starting module: " + this.name);
        this.loaded = false;
        // give the config to the node helper
        let configPayload = {
            timeLimitKeepBmpData: this.getUpdateIntervalMillisecondFromString(this.config.timeLimitKeepBmpData),
            debug: this.config.debug
        };
        // convert the updateInterval string into seconds
        this.updateIntervalMilliseconds = this.getUpdateIntervalMillisecondFromString(this.config.updateInterval);

        // give a config to the helper
        this.sendSocketNotification('INIT_HELPER', configPayload);
        // get a value and draw the module right now
        this.getNewBmpData();
        // schedule next update of the module. This will also get a new BMP data and insert it into the database
        this.scheduleUpdate();

    },

    scheduleUpdate: function(delay) {
        let nextLoad = this.updateIntervalMilliseconds;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
        if (this.config.debug){
            console.log("[MMM-bmp-sensor] Next update in " + this.updateIntervalMilliseconds + " milliseconds");
        }
        let self = this;

        setInterval(function() {
            self.getNewBmpData();
        }, nextLoad);
    },

    getScripts: function() {
        return [
            this.file("node_modules/canvas-gauges/gauge.min.js"),
            this.file('node_modules/chart.js/dist/Chart.js'),
        ];
    },

    getDom: function () {
        let wrapper = document.createElement("div");

        if (!this.loaded) {
            wrapper.innerHTML = "Loading sensor data...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }


        if (this.config.debug){
            console.log("[MMM-bmp-sensor] Database not empty");
        }
        let lastBmpData = this.currentDatabase[this.currentDatabase.length - 1];
        let lastPressureHpa = lastBmpData.bmpData.pressure / 100;

        if (this.config.showTableBmpInfo) {
            // Start building table.
            let dataTable = document.createElement("table");
            dataTable.className = "small";

            // add row
            let temperatureRow = document.createElement("tr");
            let altitudeRow = document.createElement("tr");
            let seaLevelPressureRow = document.createElement("tr");
            let pressureRow = document.createElement("tr");

            if (this.config.showTemperatureRow){
                // add temperature row
                let temperatureCell1 = document.createElement("td");
                temperatureCell1.innerHTML = "Temperature";
                temperatureRow.appendChild(temperatureCell1);
                let temperatureCell2 = document.createElement("td");
                let temperature = lastBmpData.bmpData.temperature;
                let temperatureUnit = " °C";
                if (this.config.temperatureUnit === "imperial"){
                    temperature = Math.round(temperature * 9 / 5 + 32);
                    temperatureUnit = " °F";
                }
                temperatureCell2.innerHTML = temperature + temperatureUnit;
                temperatureRow.appendChild(temperatureCell2);
                dataTable.appendChild(temperatureRow);
            }

            if (this.config.showAltitudeRow){
                // add altitude row
                let altitudeCell1 = document.createElement("td");
                altitudeCell1.innerHTML = "Altitude";
                altitudeRow.appendChild(altitudeCell1);
                let altitudeCell2 = document.createElement("td");
                altitudeCell2.innerHTML = lastBmpData.bmpData.altitude + " m";
                altitudeRow.appendChild(altitudeCell2);
                dataTable.appendChild(altitudeRow);
            }

            if (this.config.showSeaLevelPressureRow){
                // add seaLevelPressure row
                let seaLevelPressureCell1 = document.createElement("td");
                seaLevelPressureCell1.innerHTML = "Sea level pressure";
                seaLevelPressureRow.appendChild(seaLevelPressureCell1);
                let seaLevelPressureCell2 = document.createElement("td");
                seaLevelPressureCell2.innerHTML = Math.round(lastBmpData.bmpData.sealevel_pressure / 100) + " hPa";
                seaLevelPressureRow.appendChild(seaLevelPressureCell2);
                dataTable.appendChild(seaLevelPressureRow);
            }

            if (this.config.showPressureRow){
                // add pressure row
                let pressureCell1 = document.createElement("td");
                pressureCell1.innerHTML = "Pressure";
                pressureRow.appendChild(pressureCell1);
                let pressureCell2 = document.createElement("td");
                pressureCell2.innerHTML = Math.round(lastPressureHpa) + " hPa";
                pressureRow.appendChild(pressureCell2);
                dataTable.appendChild(pressureRow);
            }

            // add the table to the view
            wrapper.appendChild(dataTable);
        }

        if (this.config.showGauge) {
            // add a gauge
            let gauge = new LinearGauge({
                renderTo: document.createElement('canvas'),
                width: 160,
                height: 400,
                borderRadius: 20,
                borders: 0,
                barStrokeWidth: 20,
                minValue: 940,
                maxValue: 1080,
                minorTicks: 10,
                majorTicks: [960, 970, 980, 990, 1000, 1010, 1020, 1030, 1040, 1050, 1060],
                value: lastPressureHpa,
                units: "hPa",
                colorPlate: "black",
                colorNeedle: "white",
                tickSide: "left",
                numberSide: "left",
                needleSide: "left",
            });
            wrapper.appendChild(gauge.options.renderTo);
            gauge.draw();
        }

        if (this.config.showChart) {
            // create a chart
            // Creating the canvas.
            let ctx = document.createElement("canvas");
            ctx.style.width = "400px";
            // Adding the canvas to the document wrapper.
            wrapper.appendChild(ctx);

            let color = "rgba(255, 255, 255, 0.8)";
            let color2 = "rgba(255, 255, 255, 0.2)";

            let labels = [];
            let bmpDataArray = [];
            for (let i = 0; i < this.currentDatabase.length; i++) {
                console.log(this.currentDatabase[i]);
                labels.push(this.currentDatabase[i].date);
                bmpDataArray.push(Math.round(this.currentDatabase[i].bmpData.pressure / 100));
            }

            let data = {
                labels: labels,
                datasets: [{
                    data: bmpDataArray,
                    borderColor: color,
                    pointRadius: 0
                }]
            };

            let options = {
                legend: {
                    display: false
                },
                fill: false,
                responsive: true,
                scales: {
                    xAxes: [{
                        type: 'time',
                        display: true,
                        time: {
                            unit: this.config.chartTimeUnit,
                            distribution: 'series',
                            displayFormats: {
                                minute: 'HH:mm',
                                hour: 'HH:mm'
                            }
                        },
                        gridLines: {
                            color: color2
                        }

                    }],
                    yAxes: [{
                        display: true,
                        gridLines: {
                            color: color2
                        }
                    }]
                }
            };

            new Chart(ctx, {
                type: 'line',
                data: data,
                options: options
            });

        }
        // return the main div
        return wrapper;
    },

    getNewBmpData: function () {
        this.sendSocketNotification('GET_NEW_BMP_DATA');
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "DATABASE_RESULT") {
            this.currentDatabase = payload;
            this.loaded = true;
            this.updateDom();
        }
    },

    /** return a number of millisecond following the received intervalString
     *  Interval string is composed by a number followed by a letter.
     *  E.g:
     *      intervalString 1m will return 60000
     *      intervalString 10m will return 600000
     * @param {string} intervalString - The interval to convert into second of the book.
     */
    getUpdateIntervalMillisecondFromString: function(intervalString) {
        // console.log("[MMM-quote-of-the-day] testing string: "+ intervalString)
        // the string must contains a number followed by a letter s or m or h or d. E.g: 50m
        let regexString = new RegExp("^\\d+[smhd]{1}$");
        let updateIntervalMillisecond = 0;

        if (regexString.test(intervalString)){
            console.log("[MMM-quote-of-the-day] valid updateInterval");
            // split the integer from the letter
            let regexInteger = "^\\d+";
            let integer = intervalString.match(regexInteger);
            // console.log("[MMM-quote-of-the-day] integer: " + integer);

            // now get the letter
            let regexLetter = "[smhd]{1}$";
            let letter = intervalString.match(regexLetter);
            // console.log("[MMM-quote-of-the-day] letter: '" + letter + "'");

            // convert the letter into second
            let millisecondsMultiplier = 1000;
            switch (String(letter)) {
                case "s":
                    millisecondsMultiplier = 1000;
                    break;
                case "m":
                    millisecondsMultiplier = 1000 * 60;
                    break;
                case "h":
                    millisecondsMultiplier = 1000 * 60 * 60;
                    break;
                case "d":
                    millisecondsMultiplier = 1000 * 60 * 60 * 24;
                    break;
            }

            // convert the string into seconds
            updateIntervalMillisecond = millisecondsMultiplier * integer

        }else{
            console.log("[MMM-quote-of-the-day] invalid updateInterval, set default to 1 day");
            // set default interval to 1 day
            updateIntervalMillisecond = 1000 * 60 * 60 * 24
        }

        return updateIntervalMillisecond
    },

});