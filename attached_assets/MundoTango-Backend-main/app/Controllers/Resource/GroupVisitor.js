const _ = require("lodash")

class GroupActivity {

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
            "group_id": record.group_id || null,
            "user_id": record.user_id || null,
            "user": record.user || null,
            "is_joined": record.is_joined || null,
            "createdAt": record.createdAt || null,
            "updatedAt": record.updatedAt || null,
            "deletedAt": record.deletedAt || null
        };
    }
}

module.exports = GroupActivity