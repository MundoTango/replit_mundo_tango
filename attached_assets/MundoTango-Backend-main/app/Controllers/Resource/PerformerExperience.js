const _ = require("lodash")

class PerformerExperience {

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
            "partner_profile_link": record.partner_profile_link.split(',') || [],
            "recent_performance_url": record.recent_performance_url || null,
        }
    }
}

module.exports = PerformerExperience