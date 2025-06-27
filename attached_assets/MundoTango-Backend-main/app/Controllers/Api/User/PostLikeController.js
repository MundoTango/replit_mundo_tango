const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const Post = require('../../../Models/Post')

const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Notification = require("../../../Models/Notification");

class PostLikeController extends RestController {

    constructor() {
        super('PostLike')
        this.resource = 'PostLike';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async likePost({request, response}) {
        try {
            this.__is_paginate = false
            this.request = request;
            this.response = response;

            let postFind = await Post.instance().findRecordById(request?.body?.post_id)
            if (!postFind) {
                return this.sendError(
                    "No post found with the given id.",
                    {},
                    400
                )
            }

            let recordCreate = await this.modal.storeRecord(request)
            Notification.instance().sendNotification(request, request.user.id, postFind?.user_id, "post-like", `Post Like`, `${request.user.name} has liked your post.`, request?.user?.image_url, request?.body?.post_id)


            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                recordCreate
            )
        } catch (err) {
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

            let recordFind = await this.modal.showRecordByCondition({
                post_id: Number(request?.params?.post_id),
                user_id: request?.user?.id
            })

            if (!recordFind) return this.sendError(
                "You have not liked this post",
                {},
                400
            )

            let deleteRecord = await this.modal.destroyRecord(recordFind?.id)
            await Post.instance().decrementLikeCount(request?.params?.post_id)

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
}


module.exports = PostLikeController