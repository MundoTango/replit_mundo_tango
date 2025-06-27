
const _ = require("lodash")

class LearningSource {

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
            'id': record.id,
            'user_id': record.user_id,
            'first_teacher': record.first_teacher,
            'leading_teachers': record.leading_teachers,
            'chacarera_skill': record.chacarera_skill,
            'tango_story': record.tango_story,
            'zamba_skill': record.zamba_skill,
            'visited_buenos_aires': record.visited_buenos_aires,
            'visited_buenos_aires_at': record.visited_buenos_aires_at.split(","),
            'visited_buenos_aires_end_at': record.visited_buenos_aires_at.split(","),
            'createdAt': record.createdAt,
            'updatedAt': record.updatedAt
        }
    }
}

module.exports = LearningSource