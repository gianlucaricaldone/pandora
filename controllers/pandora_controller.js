
const OrdineController = require('./ordine_controller.js');
const ordineController = new OrdineController();

const CandelaController = require('./candela_controller.js');
const condelaController = new CandelaController();

const PIP = 0.0001;

class RegolaController {

    static convertiCandele(candele) {
        candele.forEach(candela => {
            if (candela.open > candela.close) {
                candela.high_candle = parseFloat(candela.open);
                candela.low_candle = parseFloat(candela.close);
            }
            else {
                candela.high_candle = parseFloat(candela.close);
                candela.low_candle = parseFloat(candela.open);
            }
        });
        return candele;
    }

    isOutsideBar(candele) {
        if ((candele[0].high_candle > candele[1].high_candle) && (candele[0].low_candle > candele[1].low_candle)) {
            return { 'success': true, 'type': 'OUTSIDEBAR' };
        }
        else {
            return { 'success': false, 'type': '' };
        }
    }

    isInsideBar(candele) {
        if ((candele[0].high_candle < candele[1].high_candle) && (candele[0].low_candle > candele[1].low_candle)) {
            return { 'success': true, 'type': 'INSIDEBAR' };
        }
        else {
            return { 'success': false, 'type': '' };
        }
    }

    isRisingSun(candele) {
        if ((candele[0].high_candle < candele[1].high_candle) && (candele[0].low_candle < candele[1].low_candle)) {
            return { 'success': true, 'type': 'RISINGSUN' };
        }
        else {
            return { 'success': false, 'type': '' };
        }
    }

    isDarkCloud(candele) {
        if ((candele[0].high_candle > candele[1].high_candle) && (candele[0].low_candle < candele[1].low_candle)) {
            return { 'success': true, 'type': 'DARKCLOUD' };
        }
        else {
            return { 'success': false, 'type': '' };
        }
    }

    isDojiBar(candele) {
        if (parseFloat(candele[0].open) == parseFloat(candele[0].close)) {
            return { 'success': true, 'type': 'DOJIBAR' };
        }
        else {
            return { 'success': false, 'type': '' };
        }
    }

    isImbalanceShort(candele) {
        var pip_target = ((15 * PIP) * 100) / candele[0].close;
        
        if ((candele[2].low_candle > candele[0].low_candle) &&
            ((candele[2].low_candle - candele[0].low_candle) >= pip_target)
        ) {
            return { 'success': true, 'type': 'DARKCLOUD' };
        }
        else {
            return { 'success': false, 'type': '' };
        }
    }
}

const regolaController = new RegolaController();

class PandoraController {
    constructor() { }

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
                const candele = results;

                var return_data = PandoraController.cercaRegolaCheFaMatch(candele);
                var success = return_data.success;
                var type = return_data.type;

                if (success) {
                    // CREA ORDINE
                    console.log('ORDINE >> OK - CANDELA ' + candela.start_time + " REGOLA >> " + type);
                }
                else {
                    console.log('ORDINE >> NO - CANDELA ' + candela.start_time + " NON HA GENERATO ORDINE");
                }

                callback(false, true);
            }
        });
    };

    static cercaRegolaCheFaMatch(candele) {
        // OUTSIDE BAR
        
        candele = RegolaController.convertiCandele(candele);
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
            if (regola['success']) {
                return_data = regola;
                return;
            }    
        });
        return return_data;
    }


}


module.exports = PandoraController;

