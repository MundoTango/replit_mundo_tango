const _ = require("lodash")

class DjExperience {

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
            "performed_events": record.performed_events,
            "cities": record.cities.split(',') || null,
            "favourite_orchestra": record.favourite_orchestra || null,
            "favourite_singer": record.favourite_singer || null,
            "milonga_size": record.milonga_size || null,
            "use_external_equipments": record.use_external_equipments || null,
            "dj_softwares": record.dj_softwares || null,
        }
    }
}

module.exports = DjExperience