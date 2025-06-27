const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Attachment = require('../../../Models/Attachment')
const User = require('../../../Models/User')
const {BASE_URL} = require("../../../config/constants");

class PageController extends RestController {

    constructor() {
        super('Page')

        this.resource = 'Page';
        this.__collection = false

        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async getContentBySlug({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__is_paginate = false

            let data = await this.modal.getContentBySlug(this.request.params.slug)
            return await this.sendResponse(
                200,
                "Record added successfully.",
                data
            )
        } catch (e) {
            console.log(e?.message)
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }
}


module.exports = PageController