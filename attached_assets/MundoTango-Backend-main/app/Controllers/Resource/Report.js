const _ = require("lodash")

class Report {

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
            "user_id": record.user_id,
            "report_type_id": record.report_type_id,
            "instance_type": record.instance_type,
            "instance_id": record.instance_id,
            "description": record.description,
            "status": record.status,
            "report_type": record.report_type?.name,
            "reporter_user": record.reporter_user,
            "post": record?.instance_type == "post" && record.post || undefined,
            "user": record?.instance_type == "user" && record.user || undefined,
            "group": record?.instance_type == "group" && record.group || undefined,
            "createdAt": record.createdAt,
            "updatedAt": record.updatedAt,
            "deletedAt": record.deletedAt
        }
    }
}

module.exports = Report