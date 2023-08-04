
const utils = require('./utils.js');

class OrdineController {

    createOrdineFromCandela(candela, tipo, callback) {

        function isWhatPercentOf(x, y) {
            return (x / y) * 100;
        }

        // In questo metodo partendo da una candela che triggera un tipo di pattern
        // vengono generati due ordini: uno in BUY e uno in SELL
        
        var pip = utils.getPIP(candela.close);
        var lv_ordine_h = (candela.high_candle + (utils.pips_ordine * pip)).toFixed(3);
        var lv_ordine_l = (candela.low_candle - (utils.pips_ordine * pip)).toFixed(3);

        var lv_TP_h = (lv_ordine_h + (utils.pips_TP * pip)).toFixed(3);
        var lv_TP_l = (lv_ordine_l - (utils.pips_TP * pip)).toFixed(3);
        
        var diff_price = (parseFloat(candela.high_candle) - parseFloat(candela.low_candle)).toFixed(3);
        var perc = isWhatPercentOf(diff_price, candela.close.toFixed(3));

        var gain_perc = isWhatPercentOf((lv_TP_h - lv_ordine_h), lv_ordine_h);
        var gain = utils.bet * (gain_perc / 100);

        console.log("\nCHIUSURA CANDELA: " + candela.start_time + " PZ START: " + candela.open.toFixed(3) + " PZ CLOSE: " + candela.close.toFixed(3) + " DIFF: " + diff_price + " %: " + perc);
        console.log("ORD BUY " + tipo + " DA: " + lv_ordine_h + "A: " + lv_TP_h);
        console.log("GAIN %: " + gain_perc + " CASH: " + gain);
        // console.log("ORD SELL " + tipo + " DA: " + lv_ordine_l + " A: " + lv_TP_l + "\n");

        callback(false, true);
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