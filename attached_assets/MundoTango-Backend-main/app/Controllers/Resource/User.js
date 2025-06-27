const { getImageUrl } = require("../../Helper");
const _ = require("lodash")
const {BASE_URL} = require("../../config/constants");

class User {

    static async initResponse(data, request) {
        if (_.isEmpty(data))
            return [];

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
            "firstname": record.firstname || '',
            "lastname": record.lastname || '',
            "name": record.name || '',
            "username": record.username || '',
            "email": record.email,
            "image_url": record.user_images?.find(image => image.is_default === 1)?.image_url || record?.image_url ||`${BASE_URL}user/user-placeholder.jpeg`,
            "country": record.country || '',
            "city": record.city || '',
            "mobile_no": record.mobile_no,
            "form_status": record?.form_status,
            "is_profile_completed": record?.is_profile_completed,
            "is_friend_request": record?.is_friend_request,
            "api_token": api_token,
            "bio": record.bio,
            "slug": record.slug || null,
            "user_images": record.user_images || null,
            "is_privacy": record.is_privacy,
            "background_url": record.background_url,
        }
    }
}

module.exports = User