
const utils = require('./utils.js');
var async = require("async");

const Ordine = require('../models/ordine.js');
var ordineModel = new Ordine();

class OrdineController {


    createNuovoOrdineFromCandela(candela, tipo, main_callback) {

        async.parallel({
            long: function (callback) {
                var param_order_buy = OrdineController.generaParametriOrdineFromCandela(candela, tipo, utils.side.BUY);
                ordineModel.insertOrdine(param_order_buy, function (err, result) {
                    callback(err, result);
                });
            },
            short: function (callback) {
                var param_order_sell = OrdineController.generaParametriOrdineFromCandela(candela, tipo, utils.side.SELL);
                ordineModel.insertOrdine(param_order_sell, function (err, result) {
                    callback(err, result);
                });
            }
        }, function (err, results) {
            main_callback(err, results);
        });
    }


    createNuovoOrdineFromOrdine(ordine, prezzo, main_callback) {
        var param_order = OrdineController.generaParametriOrdineFromOrdine(ordine, prezzo);

        async.parallel({
            activate: function (callback) {
                OrdineController.chiudiOrdine(ordine, function(err,result) {
                    callback(err, result);
                });
            },
            cancel: function (callback) {
                OrdineController.cancellaOrdineCorrispondente(ordine, function (err, result) {
                    callback(err, result);
                });
            },
            create_TP: function (callback) {
                ordineModel.insertOrdine(param_order, function (err, result) {
                    callback(err, result);
                });
            },
            create_SL: function (callback) {
                param_order.price = param_order.stop_loss;
                param_order.side = utils.invertiSide(param_order.side);
                ordineModel.insertOrdine(param_order, function (err, result) {
                    callback(err, result);
                });
            },
        }, function (err, results) {
            main_callback(err, results);
        });
    }

    chiudiTPeSL(ordine, main_callback) {
        async.parallel({
            close: function (callback) {
                OrdineController.chiudiOrdine(ordine, function (err, result) {
                    callback(err, result);
                });
            },
            close_corrispondente: function (callback) {
                OrdineController.chiudiOrdineCorrispondente(ordine, function (err, result) {
                    callback(err, result);
                });
            },
            cancel: function (callback) {
                OrdineController.cancellaOrdineCorrispondente(ordine, function (err, result) {
                    callback(err, result);
                });
            },
        }, function (err, results) {
            main_callback(err, results);
        });
    }


    static generaParametriOrdineFromCandela(candela, tipo, side) {

        var pip = utils.getPIP(candela.close);
        // console.log('PIP: '+ pip);
        var lv_ordine_h = (candela.high_candle + (utils.pips_ordine * pip));
        var lv_ordine_l = (candela.low_candle - (utils.pips_ordine * pip));

        var lv_TP_h = parseFloat(lv_ordine_h + (utils.pips_TP * pip));
        var lv_TP_l = parseFloat(lv_ordine_l - (utils.pips_TP * pip));
        
        var stop_loss = (candela.high_candle + candela.low_candle) / 2;

        var diff_price = (parseFloat(candela.high_candle) - parseFloat(candela.low_candle));
        var perc = this.isWhatPercentOf(diff_price, candela.close);

        var gain_perc = this.isWhatPercentOf((lv_TP_h - lv_ordine_h), lv_ordine_h);
        var gain = utils.bet * (gain_perc / 100);


        // console.log("\nCHIUSURA CANDELA: " + candela.start_time);
        // console.log("PZ START: " + parseFloat(candela.open).toFixed(3) + " PZ CLOSE: " + parseFloat(candela.close).toFixed(3) + " DIFF: " + diff_price.toFixed(3) + " %: " + perc.toFixed(3));
        // console.log("ORD BUY " + tipo + " DA: " + lv_ordine_h + " - A: " + lv_TP_h);
        // console.log("ORD SELL " + tipo + " DA: " + lv_ordine_l + " - A: " + lv_TP_l);
        // console.log("GAIN %: " + gain_perc.toFixed(3) + " CASH: " + gain.toFixed(3));

        var price = 0;
        var amount = 0;
        if (side == utils.side.BUY) {
            price = lv_ordine_h;
            amount = parseFloat(utils.bet / lv_ordine_h).toFixed(8);
        }
        else {
            price = lv_ordine_l;
            amount = parseFloat(utils.bet / lv_ordine_l).toFixed(8);
        }
        return {
            'link': candela.start_time,
            'link_type': utils.link_type.CANDELA,
            'pandora_type': tipo,
            'created': 1,
            'symbol': utils.pairs,
            'side': side,
            'type': utils.type.LIMIT,
            'amount': amount,
            'price': price,
            'TP_h': lv_TP_h,
            'TP_l': lv_TP_l,
            'SL_h': stop_loss,
            'SL_l': stop_loss,
        };
    }

    static generaParametriOrdineFromOrdine(ordine, prezzo) {

        // Prezzo e' il valore triggerato dallo streaming
        var price = prezzo;

        // La side e' il contrario dell'ordine da candela. Se prima ho comprato ora vendo e viceversa
        if (ordine.side == utils.side.BUY) {
            price = ordine.TP_h;
        }
        else {
            price = ordine.TP_l;
        }

        var amount = parseFloat(utils.bet / price).toFixed(5);

        return {
            'link': ordine.id,
            'link_type': utils.link_type.ORDINE,
            'pandora_type': ordine.pandora_type,
            'created': 1,
            'symbol': utils.pairs,
            'side': ordine.side,
            'type': utils.type.LIMIT,
            'amount': amount,
            'price': price,
            'stop_loss': ordine.stop_loss
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

    static attivaOrdine(ordine, callback) {
        ordineModel.attivaOrdine(ordine, function (err, result) {
            callback(null, result);
        });
    }

    static cancellaOrdine(ordine, callback) {
        ordineModel.cancellaOrdine(ordine, function (err, result) {
            callback(null, result);
        });
    }

    static cancellaOrdineCorrispondente(ordine, callback) {
        ordineModel.cancellaOrdineCorrispondente(ordine, function (err, result) {
            callback(null, result);
        });
    }
    
    static chiudiOrdine(ordine, callback) {
        ordineModel.chiudiOrdine(ordine, function (err, result) {
            callback(null, result);
        });
    }

    static chiudiOrdineCorrispondente(ordine, callback) {
        ordineModel.chiudiOrdineCorrispondente(ordine, function (err, result) {
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