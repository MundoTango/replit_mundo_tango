const { getImageUrl } = require("../../Helper");
const _ = require("lodash")

class UserTravelling {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return [];

        this.headers = request.headers;
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
        let api_token = _.isEmpty(this.headers.authorization)
            ? Buffer.from(request.api_token).toString('base64')
            : Buffer.from(request.authorization).toString('base64');

        return {
            "id": record.id,
            "user_id": record.user_id || null,
            "event_type_id": record.event_type_id || null,
            "event_name": record.event_name || null,
            "city": record.city || null,
            "start_date": record.start_date || null,
            "end_date": record.end_date || null,
            "status": record.status || null,
            "createdAt": record.createdAt || null,
            "updatedAt": record.updatedAt || null,
            "deletedAt": record.deletedAt || null
        }
    }
}

module.exports = UserTravelling