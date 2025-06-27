const _ = require("lodash")

class EventType {

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
            "parent_id": record.parent_id || null,
            "user_id": record.user_id || null,
            "post_id": record.post_id || null,
            "comment": record.comment || null,
            "createdAt": record?.createdAt,
            "updatedAt": record?.updatedAt,
            "deletedAt": record?.deletedAt,
            "replies": record?.replies || []
        };
    }
}

module.exports = EventType