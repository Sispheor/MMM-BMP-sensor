const NodeHelper = require('node_helper');
const PythonShell = require('python-shell');


module.exports = NodeHelper.create({
    start: function () {
        console.log(this.name + ' helper started');


    },

    socketNotificationReceived: function (notification, payload) {
        console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);

        if (notification === 'GET_BMP_DATA') {
            this.getBmpData();
        }

    },

    getBmpData: function () {
        let self = this;
        let options = {
            mode: 'json',
            scriptPath: 'modules/MMM-BMP-sensor/python_lib',
        };

        PythonShell.run('adafruit_python_bpm.py', options, function (err, results) {
          if (err) throw err;
          // results is an array consisting of messages collected during execution
          console.log('adafruit_python_bpm.py results: %j', results[0]);
          self.sendSocketNotification('BMP_DATA_RESULT', results[0]);
        });
    }
});