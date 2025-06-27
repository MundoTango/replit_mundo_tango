const { getImageUrl, splitText } = require("../../Helper");
const _ = require("lodash");

class Setting {
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
      type: record.type,
      text: record.text,
      slug: record.slug,
    };
  }
}

module.exports = Setting;
