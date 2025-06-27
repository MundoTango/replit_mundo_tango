const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const RestModel = require("./RestModel");

class UserCard extends RestModel {
  constructor() {
    super("user_cards");
  }

  getFields() {
    return [
      "slug",
      "user_slug",
      "card_name",
      "card_number",
      "card_cvc",
      "card_expire",
      "card_token",
    ];
  }

  showColumns() {
    return [
      "slug",
      "user_slug",
      "card_name",
      "card_number",
      "card_cvc",
      "card_expire",
      "card_token",
    ];
  }

  softdelete() {
    return true;
  }

  async beforeCreateHook(request, params) {
    params.slug = uuidv4();
    params.user_slug = request.user.slug;
    params.createdAt = new Date();
  }

  async getCardByUserSlug(slug) {
    return this.orm.findAll({
      where: {
        user_slug: slug,
        deletedAt: null,
      },
    });
  }
}

module.exports = UserCard;
