const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");

class ReportTypeController extends RestController {

    constructor() {
        super('ReportType')
        this.resource = 'ReportType';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async addReportType({request, response}) {
        try {
            // this.__collection = false
            this.__is_paginate = false
            this.request = request;
            this.response = response;

            let recordCreate = await this.modal.createRecord({
                name: request?.body?.name || null,
                parent_id: request?.body?.parent_id || null,
            })
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
            // this.__collection = false
            this.request = request;
            this.response = response;

            let deleteRecord = await this.modal.destroyRecord(request?.params?.id)

            this.__is_paginate = false;
            return this.sendResponse(
                200,
                "Record deleted successfully.",
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
                ...(body?.name && {name: body?.name}),
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


module.exports = ReportTypeController