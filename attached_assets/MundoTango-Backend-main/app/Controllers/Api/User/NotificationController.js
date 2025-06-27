const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Attachment = require('../../../Models/Attachment')
const User = require('../../../Models/User')
const {BASE_URL} = require("../../../config/constants");

class NotificationController extends RestController {

    constructor() {
        super('Notification')

        this.resource = 'Notification';
        this.__collection = false

        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }
    
    async notificationListing ({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.getRecordByCondition(request?.query)

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                data || []
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async readAllNotification ({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.readAllNotification(request?.user?.id)

            return await this.sendResponse(
                200,
                "Notification read successfully",
                data
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async readNotificationById ({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.readNotificationById(request?.params?.id)

            return await this.sendResponse(
                200,
                "Notification read successfully",
                data
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async testNotification ({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.testNotification(request)

            return await this.sendResponse(
                200,
                "Notification sent",
                data
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async sendNotificationToAllUsers({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.sendNotificationToAllUsers(request)

            return await this.sendResponse(
                200,
                "Notification sent.",
                data
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async sendNotificationToSpecificUsers({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.sendNotificationToSpecificUsers(request)

            return await this.sendResponse(
                200,
                "Notification sent",
                data
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


module.exports = NotificationController