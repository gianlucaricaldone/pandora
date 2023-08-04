"use strict";

// const pips_ordine = 30;
// const pips_TP = 50;

// cash ingresso a mercato
const bet = 50;

const pips_ordine = 65;
const pips_TP = 100;
const PIP = 0.0001;

function getPIP(price) {
    var pip_gen = PIP * price
    console.log('PIP GEN: ' +pip_gen);
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



module.exports = {
    getPIP: getPIP,
    convertiCandele: convertiCandele,
    pips_ordine: pips_ordine,
    pips_TP: pips_TP,
    PIP: PIP,
    bet: bet
};