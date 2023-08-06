
const utils = require('./utils.js');

const Ordine = require('../models/ordine.js');
var ordineModel = new Ordine();

class OrdineController {


    createNuovoOrdineFromCandela(candela, tipo, callback) {
        var param_order_buy = OrdineController.generaParametriOrdine(candela, tipo, utils.side.BUY);
        ordineModel.insertOrdineFromCandela(param_order_buy, function (err, result) {
            callback(err, result);
        });
    }


    static generaParametriOrdine(candela, tipo, side) {

        var pip = utils.getPIP(candela.close);

        var lv_ordine_h = (candela.high_candle + (utils.pips_ordine * pip));
        var lv_ordine_l = (candela.low_candle - (utils.pips_ordine * pip));

        var lv_TP_h = parseFloat(lv_ordine_h + (utils.pips_TP * pip));
        var lv_TP_l = parseFloat(lv_ordine_l - (utils.pips_TP * pip));

        var diff_price = (parseFloat(candela.high_candle) - parseFloat(candela.low_candle));
        var perc = this.isWhatPercentOf(diff_price, candela.close);

        var gain_perc = this.isWhatPercentOf((lv_TP_h - lv_ordine_h), lv_ordine_h);
        var gain = utils.bet * (gain_perc / 100);

        var amount = parseFloat(utils.bet / lv_ordine_h).toFixed(3);

        console.log("\nCHIUSURA CANDELA: " + candela.start_time);
        console.log("PZ START: " + parseFloat(candela.open).toFixed(3) + " PZ CLOSE: " + parseFloat(candela.close).toFixed(3) + " DIFF: " + diff_price.toFixed(3) + " %: " + perc.toFixed(3));
        console.log("ORD BUY " + tipo + " DA: " + lv_ordine_h.toFixed(3) + " - A: " + lv_TP_h.toFixed(3));
        console.log("GAIN %: " + gain_perc.toFixed(3) + " CASH: " + gain.toFixed(3));

        return {
            'link': candela.start_time,
            'link_type': utils.link_type.CANDELA,
            'pandora_type': tipo,
            'created': 1,
            'symbol': utils.pairs,
            'side': side,
            'type': utils.type.LIMIT,
            'amount': amount,
            'price': lv_ordine_h.toFixed(3)
        };
    }

    static isWhatPercentOf(x, y) {
        return (x / y) * 100;
    }

    createOrdineFromOrdine(candela, tipo, callback) {
        // In questo metodo, dato un ordine, viene generato l'ordine di Take Profit e l'ordine di Stop Loss
        // TP: TRAILING TAKE PROFIT LIMIT SELL ORDER
        // SL: TRAILING STOP LOSS LIMIT SELL ORDER


    }

    attivaOrdine(ordine, callback) {
        ordineModel.attivaOrdine(ordine, function (err, result) {
            callback(null, result);
        });
    }

    cancellaOrdine(ordine, callback) {
        ordineModel.cancellaOrdine(ordine, function (err, result) {
            callback(null, result);
        });
    }

    getOrdiniAttivi(pairs, callback) {
        ordineModel.getOrdiniAttivi(pairs, function (err, result) {
            callback(null, result);
        });
    }
}


module.exports = OrdineController;