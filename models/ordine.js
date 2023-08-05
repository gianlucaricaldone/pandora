/*jshint multistr: true */
class Ordine {
    constructor() { }

    insertOrdine(parameters, callback) {
        var query = "INSERT IGNORE INTO ordine \
        (`symbol`, `interval`, `open`, `close`, `high`, `low`, `x`, `data`, `start_time`, `close_time` ) \
        VALUES \
        ('{symbol}', '{interval}', '{open}', '{close}', '{high}', '{low}', '{x}', '{data}', '{start_time}', '{close_time}'); \
        ".replace('{symbol}', parameters['s']).replace('{interval}', parameters['i']).replace('{open}', parameters['o']).replace('{close}', parameters['c']).replace('{high}', parameters['h']).replace('{low}', parameters['l']).replace('{x}', parameters['x']).replace('{data}', parameters['data']).replace('{start_time}', parameters['t']).replace('{close_time}', parameters['T']);

        // console.log(query);

        db.executeQuery(query, function (err, results) {
            console.log(results.insertId);
            callback(getErrorCodeByERR(err), results);
        });
    }


    getOrdineAttivoStessoTipo(tipo, callback) {
        var query = "SELECT * FROM ordine WHERE pandora_type = '{tipo}' AND attivo = 1 LIMIT 1;".replace('{tipo}', tipo);

        // console.log(query);

        db.executeQuery(query, function (err, results) {
            callback(getErrorCodeByERR(err), results.insertId);
        });
    }

    getErrorCodeByERR(err) {
        if (err) {
            return process.env.RES_ERROR;
        } else {
            return process.env.RES_SUCCESS;
        }
    }
}



module.exports = Ordine;