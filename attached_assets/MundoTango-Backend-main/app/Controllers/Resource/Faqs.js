const _ = require("lodash")

class Faqs {

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
            "question": record.question || null,
            "answer": record.answer || null,
            "createdAt": record?.createdAt,
            "updatedAt": record?.updatedAt,
            "deletedAt": record?.deletedAt
        }
    }
}

module.exports = Faqs