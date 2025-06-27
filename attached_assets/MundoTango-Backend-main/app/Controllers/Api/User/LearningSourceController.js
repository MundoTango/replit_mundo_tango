const _ = require("lodash")

const RestController = require("../../RestController");
const { SETTING_MAPPING_ENUM } = require("../../../config/enum");
const {validateAll} = require("../../../Helper");
const User = require('../../../Models/User')

class LearningSourceController extends RestController {

    constructor() {
        super('LearningSource')
        this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async addLearningSource({ request, response }) {
        try {
            this.__collection = false

            this.request = request;
            this.response = response;

            let recordCreate;

            let find_record = await this.modal.findRecordByUserId(request?.user?.id)
            // recordCreate = await this.modal.storeBulkRecord(request);
            recordCreate = await this.modal.storeRecord(request)

            // form status -> 13
            await User.instance().updateUserFormStatus(13, request?.user?.id)
            await User.instance().updateUser({id: request?.user.id}, {
                is_profile_completed: true
            })

            this.__is_paginate = false;
            // this.__collection = "LearningSource"
            return await this.sendResponse(
                200,
                "Record added successfully.",
                recordCreate
            )
        }
        catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

    async getLearningSource({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let find_record = await this.modal.findRecordByUserId(request?.user?.id)

            this.__is_paginate = false;

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                find_record
            )
        }
        catch (err) {
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
            this.__collection = false
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
        }
        catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

}


module.exports = LearningSourceController