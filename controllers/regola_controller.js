const utils = require('./utils.js');

class RegolaController {

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
        
        var pip_target = ((15 * utils.getPIP(candele[0].close)) * 100) / candele[0].close;

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

module.exports = RegolaController;

