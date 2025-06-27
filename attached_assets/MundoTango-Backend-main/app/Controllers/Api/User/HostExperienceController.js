const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Attachment = require('../../../Models/Attachment')
const User = require('../../../Models/User')
const {BASE_URL} = require("../../../config/constants");

class HostExperienceController extends RestController {

    constructor() {
        super('HostExperience')

        this.resource = 'HostExperience';
        // this.__collection = false

        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async addHostExperience({request, response}) {
        try {
            // this.__collection = false

            this.request = request;
            this.response = response;

            let recordCreate;

            let createBody = []

            for (let i = 0; i < request.body.length; i++) {
                createBody.push({
                    ...request.body[i],
                    user_id: request?.user?.id,
                    city: request.body[i]?.city.join(",")
                })
            }

            recordCreate = await this.modal.storeBulkRecord(request, createBody);

            // form status -> 8
            await User.instance().updateUserFormStatus(8, request?.user?.id)

            this.__is_paginate = false;
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

    async addAttachments({request, response}) {
        try {
            this.__collection = false
            this.__is_paginate = false;

            this.request = request;
            this.response = response;

            let body = request.body

            const fileObject = this.request.files;

            const groupedImages = {};

            if(!fileObject) {
                return await this.sendResponse(
                    200,
                    "Record added successfully.",
                    []
                )
            }

            let cnt = 0
            for (const image of fileObject) {
                const key = image.fieldname; // 'image[0]', 'image[1]', etc.
                const image_url = await FileHandler.doUpload(image, getUploadDirectoryPath(UPLOAD_DIRECTORY.USER));
                // If the key doesn't exist, create an array for it
                if (!groupedImages[key]) {
                    groupedImages[key] = [];
                    key !== 'image[0]' ? cnt++ : ''
                }

                groupedImages[key].push({
                    media_url: UPLOAD_DIRECTORY.USER + "/" + image_url,
                    instance_type: 'housing-host',
                    instance_id: Number(body?.host_id[cnt]),
                    media_type: 'image',
                    createdAt: new Date()
                });
            }

            let images = Object.values(groupedImages)
            let attachments = []
            for (let i = 0; i < images.length; i++) {
                attachments.push(await Attachment.instance().storeBulkRecord(images[i]))
            }

            return await this.sendResponse(
                200,
                "Record added successfully.",
                attachments
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

    async getHostExperience({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let find_record = await this.modal.findRecordByUserId(request?.user?.id)

            this.__is_paginate = false;
            this.__collection = false
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

}


module.exports = HostExperienceController