const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const Post = require('../../../Models/Post')

const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const PostComment = require("../../../Models/PostComment");

class PostCommentLikeController extends RestController {

    constructor() {
        super('PostCommentLike')
        this.resource = 'PostCommentLike';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async likeComment({request, response}) {
        try {
            this.__is_paginate = false
            this.request = request;
            this.response = response;

            let commentFind = await PostComment.instance().findRecordById(request?.body?.comment_id)
            if (!commentFind) {
                return this.sendError(
                    "No comment found with the given id.",
                    {},
                    400
                )
            }

            let recordCreate = await this.modal.storeRecord(request)

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

            let recordFind = await this.modal.showRecordByCondition({
                comment_id: Number(request?.params?.comment_id),
                user_id: request?.user?.id
            })

            if (!recordFind) return this.sendError(
                "You have not liked this comment",
                {},
                400
            )

            let deleteRecord = await this.modal.destroyRecord(recordFind?.id)
            await PostComment.instance().decrementLikeCount(request?.params?.comment_id)

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


module.exports = PostCommentLikeController