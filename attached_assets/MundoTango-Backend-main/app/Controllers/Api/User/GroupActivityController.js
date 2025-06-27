const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath, validateAsync} = require("../../../Helper");
const User = require('../../../Models/User')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");

class GroupActivityController extends RestController {

    constructor() {
        super('GroupActivity')
        this.resource = 'GroupActivity';
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
                    group_id: "required",
                    non_tango_activity_id: 'required',
                }
                validator = await validateAll(this.request.body, rules, customMessages)
                break;
        }
        return validator;
    }




    async update({request, response}) {
        try {
            this.request = request
            this.response = response

            let {id} = request.params

            const fileObject = this.request.files;
            let image_url = null
            if (fileObject.length > 0) {
                const image = await FileHandler.doUpload(fileObject[0], getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                image_url = UPLOAD_DIRECTORY.POST + "/" + image
            }

            let body = request.body

            await this.modal.updateRecord(id, {
                ...(body?.parent_id && {parent_id: body?.parent_id}),
                ...(body?.name && {name: body?.name}),
                ...(image_url && {icon_url: image_url})
            })

            let updateRecord = await this.modal.findRecordById(id)

            this.__is_paginate = false;
            return this.sendResponse(
                200,
                "Record deleted successfully.",
                updateRecord
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

}


module.exports = GroupActivityController