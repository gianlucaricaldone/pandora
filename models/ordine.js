/*jshint multistr: true */
class Ordine {
    constructor() { }

    insertOrdineFromCandela(parameters, callback) {

        var key = ['id', 'link', 'link_type', 'pandora_type', 'created', 'open', 'closed', 'cancelled', 'symbol', 'side', 'type', 'amount', 'price', 'params'];
        var string_key = key.join('`');
        var string_params = '';
        key.forEach(element => {
            string_params += "'" + parameters[element] + "',";
        });
        string_params.slice(0, -1);

        var query = "INSERT IGNORE INTO ordine \
            (`{}` ) \
            VALUES \
            ({string_params}); \
        ".replace('{string_key}', string_key).replace('{string_params}', string_params);


        console.log(query);

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

    getOrdiniAttivi(callback) {
        var query = "SELECT * FROM ordine WHERE open = 1 OR created = 1 LIMIT 1;";

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