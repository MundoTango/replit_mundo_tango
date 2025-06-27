const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const Attachment = require('../../../Models/Attachment')
const Post = require('../../../Models/Post')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const {HasMany, Sequelize} = require("sequelize");

class PostController extends RestController {

    constructor() {
        super('Post')
        this.resource = 'Post';
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async afterShowLoadModel() {
        this.resource = 'PostById'
    }

    async createPost({request, response}) {
        try {
            this.request = request;
            this.response = response;

            // validation
            let rules = {
                "content": 'required',
                "visibility": 'required',
                "status": 'required',
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let recordCreate = await this.modal.storeRecord(request)

            const fileObject = this.request.files;
            let data = []
            for (const image of fileObject) {
                const image_url = await FileHandler.doUpload(image, getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                console.log(image?.mimetype)
                data.push({
                    media_url: UPLOAD_DIRECTORY.POST + "/" + image_url,
                    instance_type: 'post',
                    instance_id: Number(recordCreate?.id),
                    media_type: image?.mimetype.includes('video') ? 'video' : 'image',
                    createdAt: new Date()
                })
            }

            await Attachment.instance().storeBulkRecord(data)

            let post = await this.modal.findRecordById(recordCreate?.id)
            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                post
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

    async createEventPost({request, response}) {
        try {
            this.request = request;
            this.response = response;

            // validation
            let rules = {
                "visibility": 'required',
                "status": 'required',
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let recordCreate = await this.modal.createRecord(request, {
                ...(request.body.content && {content: request.body.content}),
                user_travel_id: request?.user?.id,
                visibility: request.body?.visibility || 'public',
                status: request.body?.status,
                user_id: request?.user?.id,
            })

            let post = await this.modal.findRecordById(recordCreate?.id)
            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                post
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

    async getAllPosts({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let find_record = await this.modal.findAllRecord(request)

            this.request.query.total = find_record?.count

            this.__is_paginate = true;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                find_record?.rows
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

    async getPostById({request, response}) {
        try {
            this.request = request;
            this.response = response;
            this.resource = "PostById"

            let find_record = await this.modal.findRecordById(request?.params?.id)

            this.__is_paginate = false;
            this.__collection = true
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

    async updatePost({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = false;

            let post = await this.modal.getRecordById(request, request.params.id)

            if (_.isEmpty(post)) return this.sendError(
                "Post not found.",
                {},
                400
            )

            if (post?.user_id != request.user.id) return this.sendError(
                "You cannot edit this post.",
                {},
                400
            )

            await this.modal.updateRecordById(this.request)

            const fileObject = this.request.files;
            if (!_.isEmpty(fileObject)) {
                let data = []
                for (const image of fileObject) {
                    const image_url = await FileHandler.doUpload(image, getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                    console.log(image?.mimetype)
                    data.push({
                        media_url: UPLOAD_DIRECTORY.POST + "/" + image_url,
                        instance_type: 'post',
                        instance_id: Number(request.params?.id),
                        media_type: image?.mimetype.includes('video') ? 'video' : 'image',
                        createdAt: new Date()
                    })
                }

                await Attachment.instance().storeBulkRecord(data)
            }

            let updatedPost = await this.modal.findRecordById(request.params.id)

            return await this.sendResponse(
                200,
                "Record updated successfully.",
                updatedPost
            )
        } catch (e) {
            console.log(e);
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async getPosts({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = true;
            this.__collection = false

            let posts = await Post.instance().getAllPostForAdmin(request)
            request.query.total = posts.count

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                posts.rows
            )
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )

        }
    }

    async activeStatusGroup({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = false;

            await this.modal.orm.update({
                status: Sequelize.literal('case when status="active" then "inactive" else "active" end')
            }, {
                where: {
                    id: request.params.id
                }
            })

            return await this.sendResponse(
                200,
                "Post block status updated.",
                {}
            )
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }
}


module.exports = PostController