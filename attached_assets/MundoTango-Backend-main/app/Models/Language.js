const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");

class Language extends RestModel {
    constructor() {
        super("languages");
    }

    getFields() {
        return ["id", "name", "code", "country", "isRTL"];
    }

    showColumns() {
        return ["id", "name", "code", "country", "isRTL"];
    }

    exceptUpdateField() {
        return ["id"];
    }

    async beforeCreateHook(request, params) {
        params.user_id = request.user.id
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }

    async getRecords(request, params) {
        let data = await this.orm.findAll({
            attributes: ['id', 'name', 'country', 'code']
        })
        return _.isEmpty(data) ? [] : data.map(item => item.toJSON());
    }
}

module.exports = Language;
