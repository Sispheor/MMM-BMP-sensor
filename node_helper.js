const NodeHelper = require('node_helper');
const PythonShell = require('python-shell');
const Datastore = require('nedb')

module.exports = NodeHelper.create({
    start: function () {
        console.log(this.name + ' helper started');

        this.helperConfig = {};

        // create a database
        this.db = new Datastore({
            filename: '/tmp/mmm-bpm-datastore',
            autoload: true
        });

    },

    socketNotificationReceived: function (notification, payload) {
        console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
        if (notification === 'INIT_HELPER') {
            this.helperConfig = payload
        }
        if (notification === 'GET_NEW_BMP_DATA') {
            this.saveNewBmpEntryInDatabase();
        }
        if (notification === 'GET_CURRENT_DATABASE') {
            this.getCurrentDatabase();
        }

    },

    getBmpData: function () {
        let self = this;
        let options = {
            mode: 'json',
            scriptPath: 'modules/MMM-BMP-sensor/python_lib',
        };

        // testing returns
        return {
            "sealevel_pressure": "98029.00",
            "pressure": "98018.00",
            "altitude": "277.84",
            "temperature": "22.90"
        };
        // self.sendSocketNotification('BMP_DATA_RESULT', returnedData);
        // return returnedData

        // PythonShell.run('adafruit_python_bpm.py', options, function (err, results) {
        //   if (err) throw err;
        //   // results is an array consisting of messages collected during execution
        //   console.log('adafruit_python_bpm.py results: %j', results[0]);
        //   self.sendSocketNotification('BMP_DATA_RESULT', results[0]);
        // });
    },

    saveNewBmpEntryInDatabase: function () {
        /**
         * This method will insert the current pressure and insert it into the database with the current timestamp
         */

        let bmpData = this.getBmpData();
        let dateNow = new Date();

        let datedBmp = {
            date: dateNow,
            bmpData: bmpData
        };

        this.db.insert(datedBmp, function (err, newDoc) { // Callback is optional
            console.log("New data saved");
        });

        // clean old data
        this.cleanOutdatedBmpData();
    },

    cleanOutdatedBmpData: function () {
        /**
         * Clean old data from the database
         * @type {Date}
         */
        let limitDateBmpData = new Date();
        console.log(limitDateBmpData);
        console.log(this.helperConfig.limitKeepBmpData);
        limitDateBmpData.setMilliseconds(limitDateBmpData.getMilliseconds() - this.helperConfig.limitKeepBmpData);
        console.log(limitDateBmpData);
        let self = this;
        this.db.find({}, function (err, bmpData) {
            for (let i = 0; i < bmpData.length; i++) {
                console.log(bmpData[i]);
                if (bmpData[i].date <  limitDateBmpData ){
                    self.db.remove(bmpData[i], {}, function (err, numRemoved){
                        console.log(bmpData[i].date + "removed");
                    });
                }
            }
        });
    },
    
    getCurrentDatabase: function () {
        let self = this;
        this.db.find({}, function (err, bmpData) {
            self.sendSocketNotification('DATABASE_RESULT', bmpData);
        });
    }

});