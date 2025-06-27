const _ = require("lodash")

const RestController = require("../../RestController");
const { SETTING_MAPPING_ENUM } = require("../../../config/enum");
const {validateAll} = require("../../../Helper");
const User = require('../../../Models/User')

class PhotographerExperienceController extends RestController {

    constructor() {
        super('PhotographerExperience')
        this.resource = 'PhotographerExperience';
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async addPhotographerExperience({ request, response }) {
        try {

            this.request = request;
            this.response = response;

            let rules = {
                "role": 'required',
                "cities": 'required',
            }
            let validator = await validateAll(request.body, rules, );
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let recordCreate;
            let exist = await this.modal.dateExistInTangoActivities(request)
            if(!exist) {
                return this.sendError(
                    "Internal server error. Please try again later.",
                    "Please provide Photographer Experience date.",
                    400
                )
            }
            let find_record = await this.modal.findRecordByUserId(request?.user?.id)
            if(find_record) {
                recordCreate = await this.modal.updateRecordByUserId(request?.body, request?.user?.id)
            } else recordCreate = await this.modal.storeRecord(request);

            // form status -> 10
            await User.instance().updateUserFormStatus(10, request?.user?.id)

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

    async getPhotographerExperience({request, response}) {
        try {
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


module.exports = PhotographerExperienceController