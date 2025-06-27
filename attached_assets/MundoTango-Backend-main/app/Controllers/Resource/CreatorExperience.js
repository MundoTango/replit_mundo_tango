const _ = require("lodash")

class CreatorExperience {

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
            "shoes_url": record.shoes_url || null,
            "clothing_url": record.clothing_url || null,
            "jewelry": record.jewelry || null,
            "vendor_activities": record.vendor_activities || null,
            "vendor_url": record.vendor_url || null,
        }
    }
}

module.exports = CreatorExperience