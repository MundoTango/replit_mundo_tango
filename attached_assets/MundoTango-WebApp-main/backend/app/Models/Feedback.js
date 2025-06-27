const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");

const RestModel = require("./RestModel");

class FeedBack extends RestModel {
  constructor() {
    super("feedback");
  }

  getFields() {
    return [];
  }

  showColumns() {
    return [];
  }

  softdelete() {
    return true;
  }

  async createcontent(body) {
    return this.orm.create(body);
  }
}

module.exports = FeedBack;
