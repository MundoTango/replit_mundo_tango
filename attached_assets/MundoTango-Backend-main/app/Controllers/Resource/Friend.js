const _ = require("lodash")

class Friend {

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
            "friend_id": record.friend_id || null,
            "have_we_danced": record.have_we_danced || null,
            "city_we_meet": record.city_we_meet || null,
            "when_did_we_meet": record.when_did_we_meet || null,
            "event_we_meet": record.event_we_meet || null,
            "connect_reason": record.connect_reason || null,
            "sender_notes": record.sender_notes || null,
            "receiver_notes": record.receiver_notes || null,
            "status": record.status || null,
            "attachments": record.attachments || null,
            "friend_user": record.friend_user || {},
            "friend": record.friend || {},
            "createdAt": record.createdAt || null,
        }
    }
}

module.exports = Friend