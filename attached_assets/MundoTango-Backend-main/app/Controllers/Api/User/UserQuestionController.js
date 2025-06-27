const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM} = require("../../../config/enum");
const {validateAll} = require("../../../Helper");
const User = require('../../../Models/User')

class UserQuestionController extends RestController {

    constructor() {
        super('UserQuestions')
        this.resource = 'UserQuestions';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async addUserQuestions({request, response}) {
        try {
            // this.__collection = false

            this.request = request;
            this.response = response;

            let rules = {
                "city": 'required',
                "start_dancing": 'required',
                "lived_for_tango": "required",
                "languages": "required",
                "website_url": "required",
                "dance_role_leader": "required",
                "dance_role_follower": "required",
                "about": "required",
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let recordCreate;
            let find_record = await this.modal.findRecordByUserId(request?.user?.id)
            if (find_record) {
                recordCreate = await this.modal.updateRecordByUserId(request?.body, request?.user?.id)
            } else recordCreate = await this.modal.storeRecord(request);

            // form status -> 2
            await User.instance().updateUserFormStatus(2, request?.user?.id)
            if (request.body.city) {
                await User.instance().orm.update({
                    city: Array.isArray(request.body.city) ? request.body.city.at(-1) : request.body.city
                }, {
                    where: {
                        id: request.user.id
                    }
                })
            }

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                recordCreate
            )
        } catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

    async getUserQuestions({request, response}) {
        try {
            // this.__collection = false
            this.request = request;
            this.response = response;

            let find_record = await this.modal.findRecordByUserId(request?.user?.id)

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                find_record
            )
        } catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

    async show({request, response}) {
        try {
            // this.__collection = false
            this.request = request;
            this.response = response;

            let find_record = await this.modal.findRecordById(request?.params?.id)


            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                find_record
            )
        } catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

    async delete({request, response}) {
        try {
            this.__collection = false
            this.request = request;
            this.response = response;

            let deleteRecord = await this.modal.destroyRecord(request?.params?.id)

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                deleteRecord
            )
        } catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

}


module.exports = UserQuestionController