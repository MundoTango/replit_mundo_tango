const _ = require("lodash")

const RestController = require("../../RestController");
const { SETTING_MAPPING_ENUM } = require("../../../config/enum");
const {validateAll} = require("../../../Helper");
const User = require('../../../Models/User')

class CreatorExperienceController extends RestController {

    constructor() {
        super('CreatorExperience')
        this.resource = 'CreatorExperience';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async addCreatorExperience({ request, response }) {
        try {
            // this.__collection = false

            this.request = request;
            this.response = response;

            let recordCreate;
            let exist = await this.modal.dateExistInTangoActivities(request)
            if(!exist) {
                return this.sendError(
                    "Internal server error. Please try again later.",
                    "Please provide Performer Experience date.",
                    400
                )
            }
            let find_record = await this.modal.findRecordByUserId(request?.user?.id)
            if(find_record) {
                recordCreate = await this.modal.updateRecordByUserId(request?.body, request?.user?.id)
            } else recordCreate = await this.modal.storeRecord(request);

            // form status -> 9
            await User.instance().updateUserFormStatus(9, request?.user?.id)

            this.__is_paginate = false;
            // this.__collection = false
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

    async getCreatorExperience({request, response}) {
        try {
            // this.__collection = false
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

    async delete({request, response}) {
        try {
            // this.__collection = false
            this.request = request;
            this.response = response;

            let deleteRecord = await this.modal.destroyRecord(request?.params?.id)

            this.__is_paginate = false;
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                deleteRecord
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


module.exports = CreatorExperienceController