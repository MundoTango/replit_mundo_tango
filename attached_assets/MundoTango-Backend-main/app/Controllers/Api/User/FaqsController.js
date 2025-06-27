
const _ = require("lodash")

const RestController = require("../../RestController");

class FaqsController extends RestController {

    constructor() {
        super('Faqs')
        this.resource = 'Faqs';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }
}


module.exports = FaqsController