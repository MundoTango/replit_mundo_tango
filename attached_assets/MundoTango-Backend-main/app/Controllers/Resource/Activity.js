const _ = require("lodash")

class Activity {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return data;

        let response;
        if (Array.isArray(data)) {
            response = []
            for (var i = 0; i < data.length; i++) {
                response.push(this.jsonSchema(data[i], request));
            }
        } else {
            response = this.jsonSchema(data, request)
        }
        return response;

    }


    static jsonSchema(record, request) {
        return {
            "id": record.id,
            "parent_id": record.parent_id || null,
            "name": record.name || null,
            "icon_url": record.icon_url || null
        }
    }
}

module.exports = Activity