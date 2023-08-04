

class OrdineController {
    constructor() { }

    createOrdineFromCancela(candela, tipo, callback) {
        // In questo metodo partendo da una candela che triggera un tipo di pattern
        // vengono generati due ordini: uno in BUY e uno in SELL
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