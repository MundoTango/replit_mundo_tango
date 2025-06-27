const _ = require("lodash")

class UserSubscription {

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
        console.log(record, "expiry_date")
        return {
            "id": record.id,
            "user_id": record.user_id || null,
            "subscription_id": record.subscription_id || null,
            "user": record.user || {},
            "expiry_date": record?.expiry_date || null,
            "amount": record.amount || null,
            "status": record.status || null
        }
    }
}

module.exports = UserSubscription