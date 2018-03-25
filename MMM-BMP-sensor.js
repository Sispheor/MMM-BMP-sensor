// {"sealevel_pressure":"97942.00","pressure":"97948.00","altitude":"285.11","temperature":"23.10"}

Module.register("MMM-BMP-sensor", {

    defaults: {

    },

    start: function() {
        console.log("Starting module: " + this.name);
        this.loaded = false;
        this.getNewBmpData();
    },

    getDom: function () {
        let wrapper = document.createElement("div");

        if (!this.loaded) {
          wrapper.innerHTML = "Loading sensor data...";
          wrapper.className = "dimmed light small";
          return wrapper;
        }

        // Start building table.
        let dataTable = document.createElement("table");
        dataTable.className = "small";

        // add row
        let temperatureRow = document.createElement("tr");
        let altitudeRow = document.createElement("tr");
        let seaLevelPressureRow = document.createElement("tr");
        let pressureRow = document.createElement("tr");

        // add temperature row
        let temperatureCell1 = document.createElement("td");
        temperatureCell1.innerHTML = "Temperature";
        temperatureRow.appendChild(temperatureCell1);
        let temperatureCell2 = document.createElement("td");
        temperatureCell2.innerHTML = this.result.temperature;
        temperatureRow.appendChild(temperatureCell2);
        dataTable.appendChild(temperatureRow);

        // add altitude row
        let altitudeCell1 = document.createElement("td");
        altitudeCell1.innerHTML = "Altitude";
        altitudeRow.appendChild(altitudeCell1);
        let altitudeCell2 = document.createElement("td");
        altitudeCell2.innerHTML = this.result.altitude;
        altitudeRow.appendChild(altitudeCell2);
        dataTable.appendChild(altitudeRow);

        // add seaLevelPressure row
        let seaLevelPressureCell1 = document.createElement("td");
        seaLevelPressureCell1.innerHTML = "Sea level pressure";
        seaLevelPressureRow.appendChild(seaLevelPressureCell1);
        let seaLevelPressureCell2 = document.createElement("td");
        seaLevelPressureCell2.innerHTML = Math.round(this.result.sealevel_pressure/100) + " hPa";
        seaLevelPressureRow.appendChild(seaLevelPressureCell2);
        dataTable.appendChild(seaLevelPressureRow);

        // add pressure row
        let pressureCell1 = document.createElement("td");
        pressureCell1.innerHTML = "Pressure";
        pressureRow.appendChild(pressureCell1);
        let pressureCell2 = document.createElement("td");
        pressureCell2.innerHTML = Math.round( this.result.pressure/100 ) + " hPa";
        pressureRow.appendChild(pressureCell2);
        dataTable.appendChild(pressureRow);

        // add the table to the view
        wrapper.appendChild(dataTable);

        return wrapper;
    },

    getNewBmpData: function () {
        this.sendSocketNotification('GET_BMP_DATA');
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BMP_DATA_RESULT") {
            this.result = payload;
            this.loaded = true;
            this.updateDom();
        }
    },

});