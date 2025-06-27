const _ = require("lodash")

class Event {

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
            "name": record.name || null,
            "user_id": record.user_id || null,
            "event_type_id": record.event_type_id || null,
            "city_group_id": record.city_group_id || null,
            "image_url": record.image_url || null,
            "start_date": record.start_date || null,
            "end_date": record.end_date || null,
            "location": record.location || null,
            "city": record.city || null,
            "country": record.country || null,
            "latitude": record.latitude || null,
            "longitude": record.longitude || null,
            "visibility": record.visibility || null,
            "description": record.description || null,
            "about_space": record.about_space || null,
            "status": record.status || null,
            "going_status": record.going_status || 0,
        }
    }
}

module.exports = Event