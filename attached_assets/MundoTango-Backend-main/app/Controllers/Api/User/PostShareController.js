const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const Post = require('../../../Models/Post')

const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Notification = require("../../../Models/Notification");

class PostShareController extends RestController {

    constructor() {
        super('PostShare')
        this.resource = 'PostShare';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async sharePost({request, response}) {
        try {
            this.__is_paginate = false
            this.request = request;
            this.response = response;

            let body = request.body

            let postFind = await Post.instance().findRecordById(request?.body?.post_id)
            if (!postFind) {
                return this.sendError(
                    "No post found with the given id.",
                    {},
                    400
                )
            }

            let recordCreate = await this.modal.storeRecord(request)
            await Post.instance().clonePost(request?.body?.post_id, body?.instance_type, body?.instance_id, body?.caption, request.user.id)

            Notification.instance().sendNotification(request, request.user.id, postFind?.user_id, "post-share", `Post Share`, `${request.user.name} has shared your post.`, request?.user?.image_url, request?.body?.post_id)

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                recordCreate
            )
        } catch (err) {
            console.log(err)
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


module.exports = PostShareController