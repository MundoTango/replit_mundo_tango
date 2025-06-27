const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const RestModel = require("./RestModel");

class Setting extends RestModel {
  constructor() {
    super("settings");
  }

  getFields() {
    return ["text", "type"];
  }

  showColumns() {
    return ["slug", "type", "text"];
  }
  exceptUpdateField() {
    return ["slug", "type"];
  }
  async createcontent(body) {
    return this.orm.create(body);
  }

  async getcontent(type) {
    return this.orm.findOne({
      where: {
        type: type,
      },
      orderBy: ["createdAt", "desc"],
    });
  }

  async beforeEditHook(request, params, slug) {
    let exceptUpdateField = this.exceptUpdateField();
    exceptUpdateField.filter((exceptField) => {
      delete params[exceptField];
    });
  }
}

module.exports = Setting;
