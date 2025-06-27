const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const RestModel = require("./RestModel");
const UserCard = require("./UserCard");

class StripePayment extends RestModel {
  constructor() {
    super("stripe_payments");
  }

  getFields() {
    return ["slug", "product_slug", "amount", "created_by"];
  }

  showColumns() {
    return ["slug", "product_slug", "amount", "created_by"];
  }

  softdelete() {
    return true;
  }

  async storePaymentInformation(body) {
    body.slug = uuidv4();
    body.createdAt = new Date();

    return this.orm.create(body);
  }

  async getCardToken(slug) {
    return UserCard.instance()
      .getModel()
      .findOne({
        attributes: ["card_token"],
        where: { slug },
      });
  }
}

module.exports = StripePayment;
