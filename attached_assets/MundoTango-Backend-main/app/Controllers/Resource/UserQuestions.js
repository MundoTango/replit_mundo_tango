const _ = require("lodash")

class UserQuestions {

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
            "city": record.city.split(",") || null,
            "start_dancing": record.start_dancing || null,
            "guide_visitors": record.guide_visitors || null,
            "is_nomad": record.is_nomad || false,
            "lived_for_tango": record.lived_for_tango.split(',') || [],
            "languages": record.languages.split(',') || [],
            "website_url": record.website_url || null,
            "dance_role_leader": record.dance_role_leader || null,
            "dance_role_follower": record.dance_role_follower || null,
            "about": record.about || null,
        }
    }
}

module.exports = UserQuestions