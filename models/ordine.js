/*jshint multistr: true */
class Ordine {
    constructor() { }

    getErrorCodeByERR(err) {
        if (err) {
            return process.env.RES_ERROR;
        } else {
            return process.env.RES_SUCCESS;
        }
    }
}



module.exports = Ordine;