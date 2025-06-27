const _ = require("lodash")

class SavePost {

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
            "post_id": record.post_id || null,
            "user_id": record.user_id || null,
            "post": record.post || null
        }
    }
}

module.exports = SavePost