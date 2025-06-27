const { getImageUrl } = require("../../Helper");
const _ = require("lodash")

class GetAllUsers {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return data;

        this.headers = request.headers;
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
        let api_token = _.isEmpty(this.headers.authorization)
            ? Buffer.from(request.api_token).toString('base64')
            : Buffer.from(request.authorization).toString('base64');

        return {
            "id": record.id,
            "slug": record.slug,
            "firstname": record.firstname || '',
            "lastname": record.lastname || '',
            "name": record.name || '',
            "email": record.email,
            "image_url": getImageUrl(record.image_url),
            "mobile_no": record.mobile_no,
            "city": record.city || '',
            "bio": record.bio || '',
            "username": record.username || '',
            "country": record.country || '',
            "follower_count": record.follower_count || 0,
            "following_count": record.following_count || 0,
            "post_count": record.post_count || 0,
            "question_count": record.question_count || 0,
            "group_count": record.group_count || 0,
            "is_blocked": record.is_blocked,
            "user_type": record.user_type,
            "user_images": record.user_images || null,
            "is_privacy": record.is_privacy,
            "background_url": record.background_url,
            "tango_activities": record.tango_activities || {},
            "createdAt": record.createdAt,
            "updatedAt": record.updatedAt,
            "deletedAt": record.deletedAt,
        }
    }
}

module.exports = GetAllUsers