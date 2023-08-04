const Candela = require('../models/candela.js');
var candelaModel = new Candela();

const alpha_time = 60000;

class CandelaController {
    constructor() { }

    getCandelaPrecedente(candela, callback) {
        var start_time = parseInt(candela.start_time) - alpha_time;
        candelaModel.getCandelaByStartTime(start_time, function(err, results) {
            callback(err, results);
        });
    }

    getCandeleArretrate(candela, n, callback) {

        var array_start_time = [];
        for (let index = 0; index <= n; index++) {
            if(index > 0) {
                var diff = alpha_time * index;
                var start_time = parseInt(candela.start_time) - diff;
                array_start_time.push(String(start_time));
            }
        }
        candelaModel.getCandelaFromStartTime(array_start_time, function (err, results) {
            callback(err, results);
        });
    }

    insertCandela(parameters, callback) {
        if (parameters['x']) {
            parameters['x'] = 1;
        }
        else {
            parameters['x'] = 0;
        }
        var currentdate = new Date();
        var datetime = "" + currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        parameters['data'] = datetime;
        candelaModel.insertCandela(parameters, function(err, result) {
            callback(err, result);
        });
    }

}

module.exports = CandelaController;