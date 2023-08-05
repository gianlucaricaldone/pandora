"use strict";

// PARAMETRI FISSI
const alpha_time = 60000;
const PIP = 0.0001;
const link_type = {
    'CANDELA': 'CANDELA',
    'ORDINE': 'ORDINE',
};
const side = {
    'BUY': 'BUY',
    'SELL': 'SELL'
};
const type = {
    'LIMIT': 'LIMIT',
    'MARKET': 'MARKET',
    'STOP_LOSS': 'STOP_LOSS',
    'STOP_LOSS_LIMIT': 'STOP_LOSS_LIMIT',
    'TAKE_PROFIT': 'TAKE_PROFIT',
    'TAKE_PROFIT_LIMIT': 'TAKE_PROFIT_LIMIT',
    'LIMIT_MAKER': 'LIMIT_MAKER',
}

const qta_candele_arretrate = 2;

// PARAMETRI MODIFICABILI
const pairs = 'BTCUSDT';
const pips_ordine = 25;
const pips_TP = 50;
const min_streaming = '1m';

// cash ingresso a mercato
const bet = 100;

var url_price = 'https://www.binance.me/api/v3/ticker/price?symbol={pairs}'.replace('{pairs}', pairs);
// const pips_ordine = 65;
// const pips_TP = 100;

function getPIP(price) {
    var pip_gen = PIP * price;
    console.log('PIP GEN: ' + pip_gen);
    return pip_gen;
}

function convertiCandele(candele) {
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

function getErrorCodeByERR(err) {
    if (err) {
        return process.env.RES_ERROR;
    } else {
        return process.env.RES_SUCCESS;
    }
}

module.exports = {
    getPIP: getPIP,
    convertiCandele: convertiCandele,
    getErrorCodeByERR: getErrorCodeByERR,
    pips_ordine: pips_ordine,
    pips_TP: pips_TP,
    PIP: PIP,
    bet: bet,
    pairs: pairs,
    alpha_time: alpha_time,
    link_type: link_type,
    side: side,
    type: type,
    qta_candele_arretrate: qta_candele_arretrate,
    min_streaming: min_streaming,
    url_price: url_price
};