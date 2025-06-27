const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");

class PinGroup extends RestModel {
    constructor() {
        super("pin_groups");
    }

    getFields() {
        return ["id", "group_id", "user_id"];
    }

    showColumns() {
        return ["id", "group_id", "user_id"];
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
}

module.exports = PinGroup;
