const { getImageUrl, splitText } = require("../../Helper");
const _ = require("lodash");

class UserCard {
  static async initResponse(data, request) {
    if (_.isEmpty(data)) return Array.isArray(data) ? [] : {};

    let response;
    if (Array.isArray(data)) {
      response = [];
      for (var i = 0; i < data.length; i++) {
        response.push(this.jsonSchema(data[i], request));
      }
    } else {
      response = this.jsonSchema(data, request);
    }
    return response;
  }

  static jsonSchema(record, request) {
    return {
      card_name: record.card_name,
      card_number: record.card_number,
      card_cvc: record.card_cvc,
      card_expire: record.card_expire,
      slug: record.slug,
      user_slug: record.user_slug,
    };
  }
}

module.exports = UserCard;
