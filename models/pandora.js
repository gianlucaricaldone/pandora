/*jshint multistr: true */

class Pandora {
    constructor() { }

    getErrorCodeByERR(err) {
        if (err) {
            return process.env.RES_ERROR;
        } else {
            return process.env.RES_SUCCESS;
        }
    }
}



module.exports = Pandora;