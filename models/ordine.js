/*jshint multistr: true */
var db = require('../config/db'); 
const utils = require('../controllers/utils.js');

class Ordine {
    constructor() { }

    insertOrdineFromCandela(parameters, callback) {

        var key = ['link', 'link_type', 'pandora_type', 'created', 'open', 'closed', 'cancelled', 'symbol', 'side', 'type', 'amount', 'price', 'params'];
        var string_key = '';
        // key.join('`,`');
        var string_params = '';
        key.forEach(element => {
            if (parameters[element]) {
                string_key += "`" + element + "`,";
                string_params += "'" + parameters[element] + "',";
            }
        });
        string_params = string_params.substring(0, string_params.length - 1);
        string_key = string_key.substring(0, string_key.length - 1);

        var query = "INSERT IGNORE INTO ordine \
            ({string_key} ) \
            VALUES \
            ({string_params}); \
        ".replace('{string_key}', string_key).replace('{string_params}', string_params);


        console.log(query);

        db.executeQuery(query, function (err, results) {
            console.log(results.insertId);
            callback(utils.getErrorCodeByERR(err), results);
        });
    }


    getOrdineAttivoStessoTipo(tipo, callback) {
        var query = "SELECT * FROM ordine WHERE pandora_type = '{tipo}' AND attivo = 1 LIMIT 1;".replace('{tipo}', tipo);

        // console.log(query);

        db.executeQuery(query, function (err, results) {
            callback(utils.getErrorCodeByERR(err), results.insertId);
        });
    }

    getOrdiniAttivi(symbol, callback) {
        var query = "SELECT * FROM ordine WHERE symbol = '{symbol}' AND (open = 1 OR created = 1);".replace('{symbol}', symbol);

        // console.log(query);

        db.executeQuery(query, function (err, results) {
            callback(utils.getErrorCodeByERR(err), results);
        });
    }


}



module.exports = Ordine;