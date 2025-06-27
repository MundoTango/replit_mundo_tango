
const _ = require("lodash")

class HostExperience {

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
            "property_url": record.property_url || null,
            "city": record?.city.split(',') || null,
            "space": record.space || null,
            "people": record.people || null,
            "attachments": record.attachments || null,
        }
    }
}

module.exports = HostExperience