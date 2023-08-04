
const utils = require('./utils.js');

const RegolaController = require('./regola_controller.js');
const regolaController = new RegolaController();

const OrdineController = require('./ordine_controller.js');
const ordineController = new OrdineController();

const CandelaController = require('./candela_controller.js');
const condelaController = new CandelaController();

class PandoraController {
    
    canCandelaGeneraOrdine(candela, callback){
        // Formatto per uniformare alle vecchie candele gia inserite
        candela.start_time = candela.t;
        candela.open = candela.o;
        candela.close = candela.c;

        const index = 2;
        condelaController.getCandeleArretrate(candela, index, function(err, results) {
            if (Array.isArray(results) && parseInt(results.length) < parseInt(index)) {
                console.log('NO CANDELE PRECEDENTI');
                callback(false, true);
            }
            else {
                results.unshift(candela);
                var candele = results;
                candele = utils.convertiCandele(candele);

                var return_data = PandoraController.cercaRegolaCheFaMatch(candele);
                var success = return_data.success;
                var type = return_data.type;

                if (success) {
                    // CREA ORDINE
                    ordineController.createOrdineFromCandela(candela, type, function (err, results) { 
                        // console.log('ORDINE >> OK - CANDELA ' + candela.start_time + " REGOLA >> " + type);
                        callback(false, true);
                    });
                }
                else {
                    console.log('ORDINE >> NO - CANDELA ' + candela.start_time + " NON HA GENERATO ORDINE");
                }

                callback(false, true);
            }
        });
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

