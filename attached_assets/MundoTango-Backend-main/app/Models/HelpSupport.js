const _ = require("lodash")

const RestModel = require("./RestModel");
const LookupData = require("./LookupData");

class HelpSupport extends RestModel {

    constructor() {
        super("help_supports")
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
        return [            'name', 'email', 'createdAt', 'phone_number', 'query'
        ];
    }



    showColumns() {
        return [
            'name', 'email', 'createdAt', 'phone_number', 'query'
        ];
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

module.exports = HelpSupport;