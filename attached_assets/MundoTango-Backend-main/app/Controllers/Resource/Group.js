const _ = require("lodash")

class Group {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return data;

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
            "group_type": record.group_type || null,
            "name": record.name || null,
            "image_url": record.image_url || null,
            "location": record.location || null,
            "city": record.city || null,
            "country": record.country || null,
            "latitude": record.latitude || null,
            "longitude": record.longitude || null,
            "privacy": record.privacy || null,
            "number_of_participants": record.number_of_participants || 0,
            "description": record.description || null,
            "status": record.status || null,
            "total_followers": record.total_followers || 0,
            "createdAt": record.createdAt || null,
            "updatedAt": record.updatedAt || null,
            "deletedAt": record.deletedAt || null,
            "user": record.user || null,
            "group_members": record.group_members || null,
            "is_joined": record.is_joined,
            "is_pinned": record.is_pinned,
        };
    }
}

module.exports = Group