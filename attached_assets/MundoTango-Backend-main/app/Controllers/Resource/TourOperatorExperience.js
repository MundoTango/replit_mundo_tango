const _ = require("lodash")

class TourOperatorExperience {

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
            "cities": record.cities.split(',') || [],
            "website_url": record.website_url || null,
            "theme": record.theme || null,
            "vendor_activities": record.vendor_activities || null,
            "vendor_url": record.vendor_url || null,
        }
    }
}

module.exports = TourOperatorExperience