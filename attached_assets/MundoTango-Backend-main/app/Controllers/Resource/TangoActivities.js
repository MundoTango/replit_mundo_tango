const _ = require("lodash")

class TangoActivities {

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
            "teacher_at": record.teacher_at || null,
            "dj_at": record.dj_at || null,
            "photographer_at": record.photographer_at || null,
            "host_at": record.host_at || null,
            "organizer_at": record.organizer_at || null,
            "creator_at": record.creator_at || null,
            "performer_at": record.performer_at || null,
            "tour_operator_at": record.tour_operator_at || null,
            "other": record.other || null,
            "social_dancer": record.social_dancer || null,
        }
    }
}

module.exports = TangoActivities