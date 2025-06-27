const { baseUrl, getImageUrl } = require("../../Helper");
const _ = require("lodash")

class UserProfile {

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

        return {
            "name": record.name,
            "slug": record.slug,
            "username": record.username,
            "sports_type": record.sports_type,
            "gender": record.gender,
            "email": record.email,
            "image_url": getImageUrl(record.image_url),
            "followers": record.followers,
            "followings": record.followings,
            "followed_slug": _.isEmpty(record?.Follow_FollowedUserSlug) ? null : record?.Follow_FollowedUserSlug[0].slug
        }
    }
}

module.exports = UserProfile