/*jshint multistr: true */
var db = require('../config/db');
var getErrorCodeByERR = (err) => {
    if (err) {
        return process.env.RES_ERROR;
    } else {
        return process.env.RES_SUCCESS;
    }
};

class Candela {
    constructor() { }

    insertCandela(parameters, callback) {
        var query = "INSERT IGNORE INTO candela \
        (`symbol`, `interval`, `open`, `close`, `high`, `low`, `x`, `data`, `start_time`, `close_time` ) \
        VALUES \
        ('{symbol}', '{interval}', '{open}', '{close}', '{high}', '{low}', '{x}', '{data}', '{start_time}', '{close_time}'); \
        ".replace('{symbol}', parameters['s']).replace('{interval}', parameters['i']).replace('{open}', parameters['o']).replace('{close}', parameters['c']).replace('{high}', parameters['h']).replace('{low}', parameters['l']).replace('{x}', parameters['x']).replace('{data}', parameters['data']).replace('{start_time}', parameters['t']).replace('{close_time}', parameters['T']);
        
        // console.log(query);

        db.executeQuery(query, function (err, results) {
            callback(getErrorCodeByERR(err), results);
        });
    }

    getCandelaByStartTime(start_time, callback) {
        var query = "SELECT * FROM candela WHERE start_time = '{start_time}' LIMIT 1;".replace('{start_time}', start_time);

        // console.log(query);

        db.executeQuery(query, function (err, results) {
            callback(getErrorCodeByERR(err), results);
        });
    }

    getCandelaFromStartTime(start_time, callback) {
        var query = "SELECT * FROM candela WHERE start_time IN ({start_time}) order by 1 desc;".replace('{start_time}', start_time);

        // console.log(query);

        db.executeQuery(query, function (err, results) {
            callback(getErrorCodeByERR(err), results);
        });
    }

}



module.exports = Candela;