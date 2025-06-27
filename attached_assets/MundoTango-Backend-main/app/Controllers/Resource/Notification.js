const _ = require("lodash")

class Notification {

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
            "slug": record.slug || null,
            "url": record.url || null,
            "title": record.title || null,
            "content": record.content || null,
            "instance_id": record?.instance_id
        };
    }
}

module.exports = Notification