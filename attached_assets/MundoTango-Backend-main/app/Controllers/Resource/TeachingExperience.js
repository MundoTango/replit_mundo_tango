const _ = require("lodash")

class TeachingExperience {

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
            "partner_facebook_url": record.partner_facebook_url || null,
            "cities": record.cities.split(',') || null,
            "online_platforms": record.online_platforms.split(',') || null,
            "about_tango_future": record.about_tango_future || null,
            "preferred_size": record?.preferred_size || null,
            "teaching_reason": record?.teaching_reason || null,
        }
    }
}

module.exports = TeachingExperience