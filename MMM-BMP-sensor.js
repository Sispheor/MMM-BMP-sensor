

Module.register("MMM-BMP-sensor", {

    defaults: {

    },

    start: function() {
        console.log("Starting module: " + this.name);

        this.getNewBmpData();
    },

    getDom: function () {
        let wrapper = document.createElement("div");


        wrapper.innerHTML = "barometer";
        return wrapper;
    },

    getNewBmpData: function () {
        this.sendSocketNotification('GET_BMP_DATA');
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BMP_DATA_RESULT") {
            this.result = payload;
            this.updateDom();
        }
    },

});