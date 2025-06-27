const _ = require("lodash");
const { validateAll } = require("../../../Helper/index.js");
const RestController = require("../../RestController.js");
const { v4: uuidv4 } = require("uuid");

class SettingController extends RestController {
  constructor() {
    super("Setting");
    this.resource = "Setting";
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
          text: "required",
          type: "required",
        };
        validator = await validateAll(this.request.body, rules);

        break;
      case "update":
        break;
    }
    return validator;
  }

  async createcontent({ request, response }) {
    try {
      this.request = request;
      this.response = response;
      let rules = {
        text: "required",
        type: "required",
      };

      let validator = await validateAll(request.body, rules);
      let validation_error = this.validateRequestParams(validator);
      if (this.__is_error) return validation_error;

      request.body.slug = uuidv4();
      this.__is_paginate = false;
      this.__collection = true;
      const record = await this.modal.createcontent(request.body);

      return this.sendResponse(200, "Record created successfully", record);
    } catch (e) {
      console.log(e.message);
      return this.sendError("", "Record not created", 500);
    }
  }

  async getcontent({ request, response }) {
    try {
      this.request = request;
      this.response = response;

      let rules = {
        type: "required",
      };

      let validator = await validateAll(request.params, rules);
      let validation_error = this.validateRequestParams(validator);
      if (this.__is_error) return validation_error;

      this.__is_paginate = false;
      this.__collection = true;

      const { type } = request.params;
      const record = await this.modal.getcontent(type);

      return this.sendResponse(200, "Record found successfully", record);
    } catch (e) {
      console.log(e.message);
      return this.sendError("", "Record not found", 500);
    }
  }
}

module.exports = SettingController;
