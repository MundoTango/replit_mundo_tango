const _ = require("lodash")

class Language {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return {};

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
            "name": record.name || null,
            "code": record.code || null,
            "country": record.country || null,
            "isRTL": record.isRTL || null,
        }
    }
}

module.exports = Language