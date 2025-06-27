const _ = require("lodash")

class Group {

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
            "email": record.email || null,
            "phone_number": record.phone_number || null,
            "query": record.query || null,
        };
    }
}

module.exports = Group