const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const Post = require('../../../Models/Post')

const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const {Op} = require("sequelize");
const Notification = require("../../../Models/Notification");

class PostCommentController extends RestController {

    constructor() {
        super('PostComment')
        this.resource = 'PostComment';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async commentOnPost({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let rules = {
                "post_id": 'required',
                "comment": 'required',
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let postFind = await Post.instance().findRecordById(request?.body?.post_id)
            if (!postFind) {
                return this.sendError(
                    "No post found with the given id.",
                    {},
                    400
                )
            }

            let recordCreate = await this.modal.storeRecord(request)
            await Post.instance().incrementCommentCount(request?.body?.post_id)

            Notification.instance().sendNotification(request, request.user.id, postFind?.user_id, "post-comment", `Post Comment`, `${request.user.name} has commented your post.`, request?.user?.image_url, request?.body?.post_id)

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

            let body = request.body

            await this.modal.updateRecord(id, {
                ...(body?.comment && {name: body?.comment})
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

    async getCommentByPostId({request, response}) {
        try {
            this.__collection = false
            this.request = request;
            this.response = response;

            let {id} = request.params
            let {isPaginated, limit, page} = request.query

            isPaginated = isPaginated === '1'; // Check if pagination is required
            page = parseInt(page, 10) || 1; // Get the current page, default to 1 if not provided
            limit = Number(limit) || 10; // Limit the number of records to 10
            const offset = (page - 1) * Number(limit); // Calculate the offset

            let find_record;

            if (isPaginated) {
                find_record = await this.modal.getRecordByConditions(request, {
                    post_id: id,
                    parent_id: null
                }, limit, offset)
                this.request.query.total = await this.modal.getRecordCounts({
                    post_id: id,
                    parent_id: null
                })
            } else {
                find_record = await this.modal.getRecordByConditions(request,{
                    post_id: id,
                    parent_id: null
                })
            }

            this.__is_paginate = true;
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
}


module.exports = PostCommentController