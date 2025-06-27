const _ = require("lodash");
const { validateAll } = require("../../../Helper/index.js");
const RestController = require("../../RestController.js");
const StripePaymentController = require("./StripePaymentController.js");

class UserCardController extends RestController {
  constructor() {
    super("UserCard");
    this.resource = "UserCard";
    this.request; //adonis request obj
    this.response; //adonis response obj
    this.params = {}; // this is used for get parameters from url
  }

  async validation(action, id = 0) {
    let validator = [];
    let rules;

    switch (action) {
      case "store":
        rules = {
          card_name: "required",
          card_number: "required",
          card_cvc: "required",
          card_expire: "required",
          card_token: "required",
        };

        validator = await validateAll(this.request.body, rules);
        break;
      case "update":
        break;
    }
    return validator;
  }

  async beforeStoreLoadModel() {
    try {
      let customer_id = this.request.user.customer_id;

      const customerSource =
        await new StripePaymentController().createCardSourceRef(
          customer_id,
          this.request.body.card_token
        );

      this.request.body.card_token = customerSource.id;
      console.log("customerSource==>", customerSource.id);
    } catch (e) {
      console.log(e.message);
      this.__is_error = true;
      return this.sendError("Something went wrong", {}, 500);
    }
  }

  async getCardByUserSlug({ request, response }) {
    try {
      this.request = request;
      this.response = response;

      this.__is_paginate = false;
      this.__collection = true;

      const record = await this.modal.getCardByUserSlug(this.request.user.slug);

      this.sendResponse(200, "Data found Successfully", record);
    } catch (e) {
      console.log(e.message);
      return this.sendError("Data not found", {}, 500);
    }
  }
}

module.exports = UserCardController;
