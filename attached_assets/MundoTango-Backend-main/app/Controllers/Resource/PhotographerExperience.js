const _ = require("lodash")

class PhotographerExperience {

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
            "role": record.role,
            "facebook_profile_url": record.facebook_profile_url || null,
            "videos_taken_count": record.videos_taken_count || null,
            "cities": record.cities.split(',') || [],
        }
    }
}

module.exports = PhotographerExperience