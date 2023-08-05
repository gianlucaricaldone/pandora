
const utils = require('./utils.js');

class OrdineController {

    createOrdineFromCandela(candela, tipo, callback) {

        function isWhatPercentOf(x, y) {
            return (x / y) * 100;
        }

        // In questo metodo partendo da una candela che triggera un tipo di pattern
        // vengono generati due ordini: uno in BUY e uno in SELL
        
        var pip = utils.getPIP(candela.close);
        var lv_ordine_h = (candela.high_candle + (utils.pips_ordine * pip));
        var lv_ordine_l = (candela.low_candle - (utils.pips_ordine * pip));

        var lv_TP_h = parseFloat(lv_ordine_h + (utils.pips_TP * pip));
        var lv_TP_l = parseFloat(lv_ordine_l - (utils.pips_TP * pip));

        var diff_price = (parseFloat(candela.high_candle) - parseFloat(candela.low_candle));
        var perc = isWhatPercentOf(diff_price, candela.close);

        var gain_perc = isWhatPercentOf((lv_TP_h - lv_ordine_h), lv_ordine_h);
        var gain = utils.bet * (gain_perc / 100);

        var amount = parseFloat(utils.bet / lv_ordine_h).toFixed(3);


        ordineModel.getOrdineAttivoStessoTipo(tipo, function(err, result) {
            if (result >= 0) { 
                // Se esiste un ordine controllo se è da chiudere
                console.log('ORDINE ' + tipo + 'GIA ATTIVO: ID = ' + result);
                

                // CHECK SUL PREZZO E NEL CASO CHIUDERE O APRIRE

                param_order_TP = {
                    'link': result,
                    'link_type': utils.link_type.ORDINE,
                    'pandora_type': tipo,
                    'symbol': utils.pairs,
                    'side': utils.side.SELL,
                    'type': utils.type.LIMIT,
                    'amount': amount,
                    'price': lv_TP_h.toFixed(3)
                };
                ordineModel.insertOrdine(param_order_TP, function (err, result) {
                    callback(err, result);
                });
            }
            else {
                
                param_order_buy = {
                    'link': candela.start_time,
                    'link_type': utils.link_type.CANDELA,
                    'pandora_type': tipo,
                    'created': 1,
                    'symbol': utils.pairs,
                    'side': utils.side.BUY,
                    'type': utils.type.LIMIT,
                    'amount': amount,
                    'price': lv_ordine_h.toFixed(3)
                };

                ordineModel.insertOrdine(param_order_buy, function (err, result) {
                    callback(err, result);
                });
            }
        });
        // console.log("\nCHIUSURA CANDELA: " + candela.start_time);
        // console.log("PZ START: " + parseFloat(candela.open).toFixed(3) + " PZ CLOSE: " + parseFloat(candela.close).toFixed(3) + " DIFF: " + diff_price.toFixed(3) + " %: " + perc.toFixed(3));
        // console.log("ORD BUY " + tipo + " DA: " + lv_ordine_h.toFixed(3) + " - A: " + lv_TP_h.toFixed(3));
        // console.log("GAIN %: " + gain_perc.toFixed(3) + " CASH: " + gain.toFixed(3));
        


    }

    createOrdineFromOrdine(candela, tipo, callback) {
        // In questo metodo, dato un ordine, viene generato l'ordine di Take Profit e l'ordine di Stop Loss
        // TP: TRAILING TAKE PROFIT LIMIT SELL ORDER
        // SL: TRAILING STOP LOSS LIMIT SELL ORDER


    }

    getOrdiniAperti() {

    }
}


module.exports = OrdineController;