
const _ = require("lodash")

class DanceExperience {

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
            "social_dancing_cities": record.social_dancing_cities.split(',') || [],
            "recent_workshop_cities": record.recent_workshop_cities.split(',') || [],
            "favourite_dancing_cities": record.favourite_dancing_cities.split(',') || [],
            "annual_event_count": record.annual_event_count || 0,
        }
    }
}

module.exports = DanceExperience