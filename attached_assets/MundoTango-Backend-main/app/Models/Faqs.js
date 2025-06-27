const _ = require("lodash")

const RestModel = require("./RestModel");
const LookupData = require("./LookupData");

class Faqs extends RestModel {

    constructor() {
        super("faqs")
    }

    softdelete() {
        return true;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return ['id', 'question', 'answer'];
    }


    showColumns() {
        return ['id', 'question', 'answer'];

    }


    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} slug
     */
    async indexQueryHook(query, request, slug = {}) {

    }


}

module.exports = Faqs;