
const utils = require('./utils.js');
var async = require("async");

const RegolaController = require('./regola_controller.js');
const regolaController = new RegolaController();

const OrdineController = require('./ordine_controller.js');
const ordineController = new OrdineController();

const CandelaController = require('./candela_controller.js');
const condelaController = new CandelaController();

class PandoraController {
    
    canCandelaGeneraOrdine(candela, main_callback){
        // Formatto per uniformare alle vecchie candele gia inserite
        candela.start_time = candela.t;
        candela.open = candela.o;
        candela.close = candela.c;

        async.parallel({
            candele: function (callback) {
                const index = 2;
                condelaController.getCandeleArretrate(candela, utils.qta_candele_arretrate, function (err, result) {
                    callback(null, result);
                });
            },
            ordine: function (callback) {
                ordineController.getOrdiniAttivi(function (err, result) {
                    callback(null, result);
                });
            }
        }, function (err, results) {
            console.log('\nAAAA ASYNC:');
            console.log(results);
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
                    console.log('ORDINE >> NO - ORDINE DI TIPO' + type + " GIA APERTO - " + check);
                    main_callback(true, null);
                }

                if (success) {
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
        if (Array.isArray(ordini) && ordini.length !== 0) {
            var ordine_found = null;
            ordini.forEach(element => {
                if (element.pandora_type == type) {
                    ordine_found = element;
                    return;
                }
            });

            if (ordine_found) {
                return ordine_found.link;
            }
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
}

module.exports = PandoraController;

