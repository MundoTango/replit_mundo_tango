const _ = require("lodash")

class Report {

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
            "user_id": record.user_id || null,
            "blocked_user_id": record.report_type_id || null,
            "createdAt": record.createdAt || null,
            "updatedAt": record.updatedAt || null,
            "deletedAt": record.deletedAt || null
        }
    }
}

module.exports = Report