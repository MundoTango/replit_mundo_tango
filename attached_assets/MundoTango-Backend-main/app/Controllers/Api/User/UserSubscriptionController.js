const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");

class UserSubscriptionController extends RestController {

    constructor() {
        super('UserSubscription')
        this.resource = 'UserSubscription';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async validation(action, id = 0) {
        let validator = [];
        let rules;
        let customMessages = {
            required: 'You forgot to give a :attribute',
            'regex.password': "Password must contain atleast one number and one special character and should be 6 to 16 character long",
            same: ":attribute is not same as password"

        }

        switch (action) {
            case "store":
                rules = {
                    name: "required",
                    email: "required",
                }
                validator = await validateAll(this.request.body, rules, customMessages)
                break;
        }
        return validator;
    }

    async handleWebhook({request, response}){
        try{
            this.request = request;
            this.response = response;
            this.__is_paginate = false;
            this.__collection = false;
            await this.modal.handleWebhook(request);
            return this.sendResponse(200,"Success",{})
        }catch (e) {
            console.log(e);
            return this.sendError(e.message, {}, 500);
        }
    }

    async cancelSubscription({request, response}){
        try{
            this.request = request;
            this.response = response
            this.__is_paginate = false;
            this.__collection = false;
            let result = await this.modal.cancelSubscription(request);
            return this.sendResponse(200,"Your subscription has been cancelled",{})
        }catch (e) {
            console.log(e)
            return this.sendError(e.message,{},500)
        }
    }

    async getActiveSubscription({request, response}){
        try{
            this.request = request;
            this.response = response
            this.__is_paginate = false;
            let result = await this.modal.getActiveSubscription(request);
            return this.sendResponse(200,"Subscription",result)
        }catch (e) {
            console.log(e)
            return this.sendError(e.message,{},500)
        }
    }

}


module.exports = UserSubscriptionController