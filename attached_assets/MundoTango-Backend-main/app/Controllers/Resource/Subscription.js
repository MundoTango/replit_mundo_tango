const _ = require("lodash")

class Subscription {

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
            "name": record.name,
            "id": record.id,
            "description": record.description || '',
            "stripe_price_id": record.stripe_price_id || '',
            "amount": record.amount || '',
            "duration": record.duration || '',
            "status": record.status || '',
        }
    }
}

module.exports = Subscription