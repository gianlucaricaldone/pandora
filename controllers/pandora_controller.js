
const utils = require('./utils.js');
var async = require("async");

const { Console } = require('console');
var logger = require('morgan');
logger = new Console({ stdout: process.stdout, stderr: process.stderr });

const RegolaController = require('./regola_controller.js');
const regolaController = new RegolaController();

const OrdineController = require('./ordine_controller.js');
const ordineController = new OrdineController();

const CandelaController = require('./candela_controller.js');
const candelaController = new CandelaController();

const ccxt = require('ccxt');

const binanceClient = new ccxt.binance({
    apiKey: process.env.API_ENV,
    secret: process.env.API_SECRET
});

// const axios = require('axios');
// const https = require('https');


class PandoraController {
    
    startStreamBinance(pairs) {
        // Metodo che fa lo streaming del prezzo e notifica al metodo per la creazione ordine e salvataggioa  DB

        const WebsocketStream = require('@binance/connector/src/websocketStream');
        const callbacks = {
            open: () => {
                logger.debug('Connected with Websocket server');
            },
            close: () => {
                logger.debug('Disconnected with Websocket server');
            },
            message: data => {
                this.aggiungiRigaFlussoBinance(data);
            }
        };
        const websocketStreamClient = new WebsocketStream({ logger, callbacks, combinedStreams: true });
        websocketStreamClient.kline(pairs, utils.min_streaming);
    }

    aggiungiRigaFlussoBinance(params) {
        // Metodo di raccordo,
        // Riceve la candela in costruzione e controlla il prezzo con eventuali ordini aperti
        // Se la candela in ingresso si è chiusa in questo momento inserisce nella tabella candela e prova a generare un ordine

        const start = Date.now();

        var data = JSON.parse(params);
        var prezzo_attuale = data.data.k.c;
        console.log('\nPREZZO ATTUALE: ' + prezzo_attuale);
        PandoraController.gestioneOrdiniAttivi(prezzo_attuale);

        if (data.data.k.x == true) {

            // const balances = await binanceClient.fetchBalance();
            // console.log('balances');
            // console.log(balances.free['LUNA']);
            async.parallel({
                candela: function (callback) {
                    candelaController.insertCandela(data.data.k, function (err, result) {
                        // console.log(result);
                        // console.log(err);
                        callback(false, null);
                    });
                },
                ordine: function (callback) {
                    PandoraController.canCandelaGeneraOrdine(data.data.k, function (err, result) {
                        // console.log(result);
                        callback(false, null);
                    });
                }
            }, function (err, results) {
                console.log('INSERT >> OK');
                const end = Date.now();
                console.log(`Execution time: ${end - start} ms\n\n`);
            });

        }
    }


    static canCandelaGeneraOrdine(candela, main_callback) {
        // Formatto per uniformare alle vecchie candele gia inserite
        candela.start_time = candela.t;
        candela.open = candela.o;
        candela.close = candela.c;

        async.parallel({
            candele: function (callback) {
                candelaController.getCandeleArretrate(candela, utils.qta_candele_arretrate, function (err, result) {
                    callback(null, result);
                });
            },
            ordine: function (callback) {
                ordineController.getOrdiniAttivi(utils.pairs, function (err, ord) {
                    callback(null, ord);
                });
            }
        }, function (err, results) {

            // console.log('RISULTATI');
            // console.log(results);
            var candele_arretrate = results.candele;

            if (Array.isArray(candele_arretrate) && parseInt(candele_arretrate.length) < parseInt(utils.qta_candele_arretrate)) {
                console.log('NO CANDELE PRECEDENTI');
                main_callback(null, []);
            }
            else {
                candele_arretrate.unshift(candela);
                var candele = candele_arretrate;
                candele = utils.convertiCandele(candele);

                var return_data = PandoraController.cercaRegolaCheFaMatch(candele);
                var success = return_data.success;
                var type = return_data.type;

                const check = PandoraController.checkOrdiniAperti(results.ordine, type);
                if (check) {
                    console.log('ORDINE >> NO - ORDINE DI TIPO ' + type + " GIA APERTO - " + check);
                    main_callback(true, null);
                }
                else if (success) {
                    // CREA ORDINE
                    ordineController.createNuovoOrdineFromCandela(candela, type, function (err, results) {
                        // console.log('ORDINE >> OK - CANDELA ' + candela.start_time + " REGOLA >> " + type);
                        main_callback(false, true);
                    });
                }
                else {
                    console.log('ORDINE >> NO - CANDELA ' + candela.start_time + " NON HA GENERATO ORDINE");
                    main_callback(true, null);
                }
            }
        });

    }

    static checkOrdiniAperti(ordini, tipo) {
        var ordine_found = null;
        if (Array.isArray(ordini) && ordini.length !== 0) {
            ordini.forEach(element => {
                if (String(element.pandora_type) === String(tipo)) {
                    ordine_found = element;
                    return;
                }
            });

            if (ordine_found) {
                return ordine_found.link;
            }
        }
        else {
            console.log('SALTATO CONTROLLO ORDINI:  >>>  ' + ordini);
        }
        
        return false;
    }

    static cercaRegolaCheFaMatch(candele) {
        
        // candele.forEach(element => {
        //     console.log('--- ' + element.high_candle + ' - ' + element.low_candle)
        // });

        var regole_array = [
            regolaController.isImbalanceShort(candele),
            regolaController.isOutsideBar(candele),
            regolaController.isInsideBar(candele),
            regolaController.isRisingSun(candele),
            regolaController.isDarkCloud(candele),
            regolaController.isDojiBar(candele)
        ];

        var return_data = {};
        regole_array.forEach(regola => {
            if (regola.success) {
                return_data = regola;
                return;
            }    
        });
        return return_data;
    }

    static gestioneOrdiniAttivi(prezzo) {
        ordineController.getOrdiniAttivi(utils.pairs, function (err, ordini) {
            ordini.forEach(ordine => {
                // console.log('COMPARE PRICE: ' + parseFloat(ordine.price) + " - " + parseFloat(prezzo) + " --- " + (parseFloat(ordine.price) <= parseFloat(prezzo)));

                if (ordine.side == utils.side.BUY && parseFloat(ordine.price) <= parseFloat(prezzo)) {
                    console.log('ORDINE BUY ' + ordine.link + ' DA ATTIVARE | PREZZO ' + ordine.price + ' <=' + prezzo);

                    if (ordine.link_type == utils.link_type.CANDELA) {
                        console.log('ORDINE BUY --- CREO ORDINI TP E SL');
                        ordineController.createNuovoOrdineFromOrdine(ordine, prezzo, function (err, results) {
                            console.log('ORDINI DI TP E SL CREATI');
                        });
                    }
                    else if (ordine.link_type == utils.link_type.ORDINE) {
                        console.log('CHIUDERE QUESTO ORDINI E CANCELLARE LO SL CON LINK CORRISPONDENTE E LINK_TYPE = ORDINE');
                        ordineController.chiudiTPeSL(ordine, function (err, results) {
                            console.log('CHIUSI ORDINI DI TP E SL');
                        });
                    }
                    else {
                        console.log('LINK TYPE NON GESTITO: ' + ordine.link_type);
                    }
                }
                else if (ordine.side == utils.side.SELL && parseFloat(ordine.price) >= parseFloat(prezzo)) {
                    console.log('ORDINE SELL ' + ordine.link + ' DA ATTIVARE | PREZZO ' + ordine.price + '>=' + prezzo);

                    if (ordine.link_type == utils.link_type.CANDELA) {
                        console.log('ORDINE SELL --- CREO ORDINI TP E SL');
                        ordineController.createNuovoOrdineFromOrdine(ordine, prezzo, function (err, results) {
                            console.log('ORDINI DI TP E SL CREATI');
                        });
                    }
                    else if (ordine.link_type == utils.link_type.ORDINE) {
                        console.log('CHIUDERE QUESTO ORDINI E CANCELLARE il TP CON LINK CORRISPONDENTE E LINK_TYPE = ORDINE');
                        ordineController.chiudiTPeSL(ordine, function (err, results) {
                            console.log('CHIUSI ORDINI DI TP E SL');
                        });
                    }
                    else {
                        console.log('LINK TYPE NON GESTITO: ' + ordine.link_type);
                    }

                }
            });
        });
    }
}

module.exports = PandoraController;

