const _ = require("lodash")

class OrganizerExperience {

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
            "hosted_events": record.hosted_events || null,
            "hosted_event_types": record.hosted_event_types.split(',') || null,
            "cities": record.cities.split(',') || null,
        }
    }
}

module.exports = OrganizerExperience