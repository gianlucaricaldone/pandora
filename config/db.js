var mysql = require('mysql');
var db;
var exports = module.exports = {};

// Se non è presente crea una connessione al DB
function connectDatabase() {
    if (!db) {
        db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        db.connect(function (err) {
            if (!err) {
                if (process.env.TEST_MODE == 1) {
                    console.log('Database is connected!');
                }
            } else {
                console.log('Error connecting database!');
                console.log(err);
            }
        });
    }
    return db;
}

// Gli viene passata in ingresso una query e ritorna i risultati
exports.executeQuery = function (query, callback) {
    var t0 = Date.now();
    db = connectDatabase();

    if (process.env.TEST_MODE == 1) {
        console.log('-----------------------------------');
        console.log('\n' + query + '\n');
        console.log('-----------------------------------');
    }

    db.query(query, (err, rows) => {
        if (err) {
            console.log(err);
            throw err;
        }
        // console.log('Data received from Db:\n', rows);
        var t1 = Date.now();
        var timeQuery = (t1 - t0);
        if (process.env.TEST_MODE == 1) {
            if (timeQuery > 150) {
                if (query.search("password") > -1) {
                    console.log('Query login lenta');
                } else {
                    console.log(query);
                }
                console.log("SLOW QUERY ALERT: " + timeQuery + " milliseconds.");
            }
        }

        // db.end();
        callback(err, rows);
    });
};
