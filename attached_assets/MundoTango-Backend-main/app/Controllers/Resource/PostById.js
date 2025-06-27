const _ = require("lodash")

class PostById {

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
            "group_id": record.group_id || null,
            "event_id": record.event_id || null,
            "activity_id": record.activity_id || null,
            "feeling_id": record.feeling_id || null,
            "content": record.content || null,
            "total_likes": record.total_likes || 0,
            "total_comments": record.total_comments || 0,
            "total_shares": record.total_shares || 0,
            "visibility": record.visibility || null,
            "location": record.location || null,
            "country": record.country || null,
            "city": record.city || null,
            "latitude": record.latitude || null,
            "longitude": record.longitude || null,
            "status": record.status || null,
            "attachments": record.attachments || [],
            "post_comments": record.post_comments
        };
    }
}

module.exports = PostById