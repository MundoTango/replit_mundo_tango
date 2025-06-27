const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const GroupMember = require('../../../Models/GroupMember')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const Invite = require("../../../Models/Invite");
const Notification = require("../../../Models/Notification");
const GroupActivity = require("../../../Models/GroupActivity");
const Group = require("../../../Models/Group");
const Post = require("../../../Models/Post");
const sequelize = require("sequelize");
const Attachment = require("../../../Models/Attachment");
const Event = require("../../../Models/Event");
const {Op, Sequelize} = require("sequelize");

class GroupController extends RestController {

    constructor() {
        super('Group')
        this.resource = 'Group';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async createGroup({request, response}) {
        try {
            this.__is_paginate = false
            this.request = request;
            this.response = response;

            const fileObject = this.request.files;
            let image_url = null
            if (fileObject.length > 0) {
                const image = await FileHandler.doUpload(fileObject[0], getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                image_url = UPLOAD_DIRECTORY.POST + "/" + image
            }


            let body = request.body

            let rules = {
                "group_type": 'required',
                "name": 'required',
                "description": 'required',
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let recordCreate = await this.modal.createRecord({
                user_id: request?.user?.id,
                group_type: body?.group_type,
                name: body?.name,
                image_url: image_url,
                description: body?.description,
                status: body?.status,
                privacy: body?.privacy || "public",
                number_of_participants: body?.members?.length || 0,
                ...(body?.city && {city: body?.city}),
                ...(body?.country && {country: body?.country}),
                ...(body?.latitude && {latitude: Number(body?.latitude)}),
                ...(body?.longitude && {longitude: Number(body?.longitude)}),
            })
            recordCreate = recordCreate.toJSON()

            let members = request.body.members
            let memberArray = []
            memberArray.push({
                group_id: recordCreate?.id,
                user_id: request?.user.id,
                user_type: 'admin',
                status: 'joined'
            })
            if (members) {
                for (const member of members) {
                    memberArray.push({
                        group_id: recordCreate?.id,
                        user_id: member?.user_id,
                        user_type: memberArray?.user_type,
                        status: 'joined'
                    })

                    // notification
                    Notification.instance().sendNotification(request, request?.user?.id, member?.user_id, "join-group", `${request?.user?.name} created a new group`, "You are added in a new group", request?.user?.image_url, recordCreate?.id)
                }
            }
            await GroupMember.instance().storeBulkRecord(memberArray)


            let non_tango_activity = request.body?.non_tango_activity
            if (non_tango_activity) {
                let nonTangoActivity = []
                for (const non_tango of non_tango_activity) {
                    nonTangoActivity.push({
                        group_id: recordCreate?.id,
                        non_tango_activity_id: non_tango,
                    })
                }
                await GroupActivity.instance().orm.bulkCreate(nonTangoActivity)
            }

            let group = await this.modal.orm.findOne({
                where: {
                    id: recordCreate.id
                },
                include: this.modal.includeAssociations()
            })

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                group
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

    async updateGroup({request, response}) {
        try {
            this.__is_paginate = false
            this.request = request;
            this.response = response;

            const fileObject = this.request.files;
            let image_url = null
            if (fileObject.length > 0) {
                const image = await FileHandler.doUpload(fileObject[0], getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                image_url = UPLOAD_DIRECTORY.POST + "/" + image
            }
            let body = request.body


            console.log(body?.group_type, "Failed to execute request")
            let members = request.body.members
            if (members) {
                let memberArray = []
                for (const member of members) {
                    memberArray.push({
                        group_id: request.params?.id,
                        user_id: member?.user_id,
                        user_type: memberArray?.user_type,
                        status: 'joined'
                    })

                    // notification
                    Notification.instance().sendNotification(request, request?.user?.id, member?.user_id, "join-group", `${request?.user?.name} created a new group`, "You are added in a new group", request?.user?.image_url, request.params.id)
                }
                await GroupMember.instance().orm.destroy({
                    where: {
                        group_id: request.params.id
                    },
                    force: true
                })
                await GroupMember.instance().storeBulkRecord(memberArray)
            }

            let members_count = await GroupMember.instance().orm.count({
                where: {
                    group_id: request.params?.id,
                },
                distinct: true
            })

            let recordUpdate = await this.modal.orm.update({
                ...(body?.group_type && {group_type: body?.group_type}),
                ...(body?.name && {name: body?.name}),
                ...(image_url && {image_url: image_url}),
                ...(body?.description && {description: body?.description}),
                ...(body?.status && {status: body?.status}),
                ...(body?.privacy && {privacy: body?.privacy}),
                ...(body?.city && {city: body?.city}),
                ...(body?.country && {country: body?.country}),
                ...(body?.latitude && {latitude: Number(body?.latitude)}),
                ...(body?.longitude && {longitude: Number(body?.longitude)}),
                number_of_participants: parseInt(members_count)
            }, {
                where: {
                    id: request.params.id
                }
            })


            let non_tango_activity = request.body?.non_tango_activity
            if (non_tango_activity) {
                let nonTangoActivity = []
                for (const non_tango of non_tango_activity) {
                    nonTangoActivity.push({
                        group_id: request.params?.id,
                        non_tango_activity_id: non_tango,
                    })
                }
                await GroupActivity.instance().orm.destroy({
                    where: {
                        group_id: request.params?.id
                    },
                    force: true
                })
                await GroupActivity.instance().orm.bulkCreate(nonTangoActivity)
            }

            let group = await this.modal.orm.findOne({
                where: {
                    id: request?.params?.id
                },
                include: this.modal.includeAssociations()
            })

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                group
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

    async requestToJoinGroup({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let rules = {
                "group_id": 'required'
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let find_record = await GroupMember.instance().getRecordByCondition({
                group_id: request.body?.group_id,
                user_id: request?.user?.id,
            })

            if (find_record[0]?.status === "joined") return this.sendError("You already in this group.", {}, 500)
            if (find_record[0]?.status === "requested") return this.sendError("You already have requested to join this group.", {}, 500)
            if (find_record[0]?.status === "invited") return this.sendError("You are invited to join this group.", {}, 400)

            let data = await GroupMember.instance().createRecord({
                group_id: request?.body?.group_id,
                user_id: request?.user?.id,
                status: 'requested',
                user_type: 'general'
            })

            let group = await Group.instance().orm.findOne({
                where: {
                    id: request.body.group_id
                }
            })
            if (group) {
                Notification.instance().sendNotification(request, request?.user?.id, group?.user_id, "join-group", `${request?.user?.name} has requested to join a group.`, `${request?.user?.name} has requested to join a group.`, request?.user?.image_url, request?.body?.group_id)
            }

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                data
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

    async inviteToJoinGroup({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let rules = {
                "group_id": 'required',
                "user_id": 'required'
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let find_record = await GroupMember.instance().getRecordByCondition({
                group_id: request.body?.group_id,
                user_id: request?.user?.id,
            })

            if (find_record[0]?.status === "joined") return this.sendError("You already in this group.", {}, 400)
            if (find_record[0]?.status === "invited") return this.sendError("You are invited to join this group.", {}, 400)
            if (find_record[0]?.status === "requested") return this.sendError("You already have requested to join this group.", {}, 400)


            let data = await GroupMember.instance().createRecord({
                group_id: request?.body?.group_id,
                user_id: request?.body?.user_id,
                status: 'invited',
                user_type: 'general'
            })

            await Invite.instance().storeRecord({
                invite_from_id: request?.user?.id,
                invite_to_id: request.body.user_id,
                instance_type: 'group',
                instance_id: request?.body?.group_id,
                status: 'invited'
            })

            // invite notification
            Notification.instance().sendNotification(request, request?.user?.id, request.body.user_id, "request-group", `${request?.user?.name} invited to join group`, "You are invited to join a group.", request?.user?.image_url, request?.body?.group_id)

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
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

    async getInvitation({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await GroupMember.instance().getRecordByCondition({
                status: 'invited',
                user_id: request.user?.id
            })

            return await this.sendResponse(200, "Record fetched successfully", data)
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async getGroupRequest({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await GroupMember.instance().getRecordByCondition({
                status: 'requested',
                group_id: request.params?.group_id
            })

            return await this.sendResponse(200, "Record fetched successfully", data)
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async updateRequestStatus({request, response}) {
        try {
            this.request = request
            this.response = response

            let {status} = request.body

            let data = await GroupMember.instance().findRecordById(request?.params?.id)

            if (status == "withdraw") {
                await GroupMember.instance().orm.destroy({where: {id: request.params.id}})
            } else {
                await GroupMember.instance().updateRecord(request.params.id, {
                    status: status
                })
                await Invite.instance().updateRecord(request, {status}, {
                    invite_to_id: request?.user?.id,
                    instance_type: 'group',
                    instance_id: data?.group_id
                })
            }
            data = await GroupMember.instance().findRecordById(request?.params?.id)

            // invite notification
            Notification.instance().sendNotification(request, request?.user?.id, request.body.user_id, "request-group-update", `${request?.user?.name} has ${status} your request`, "Your request to join group is updated.", request?.user?.image_url, data?.group_id)

            this.__is_paginate = false;
            return await this.sendResponse(
                200,
                "Status updated successfully.",
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

    async show({request, response}) {
        try {
            // this.__collection = false
            this.request = request;
            this.response = response;

            let find_record = await this.modal.findRecordById(request)

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

    async getGroupMembers({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let following_members = await GroupMember.instance().getRecordByCondition({
                status: 'joined',
                group_id: request.params?.group_id
            })


            let group_city = await Group.instance().orm.findByPk(request.params?.group_id)

            let member_in_city = await User.instance().orm.findAll({
                where: {city: group_city?.city},
                attributes: ['image_url', 'id', 'name', 'username', 'email', 'city', 'firstname', 'lastname']
            })

            let data = {
                following_members,
                member_in_city
            }
            return await this.sendResponse(200, "Record fetched successfully", data)
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async getCityGroup({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.getRecordByCondition({
                city: request.params.city
            })

            return await this.sendResponse(200, "Record fetched successfully", data)
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async leaveGroup({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await GroupMember.instance().orm.destroy({
                where: {
                    user_id: request.user.id,
                    group_id: request.params.id
                }
            })

            return await this.sendResponse(200, "Group leaved.", data)
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async getGroupTimeLine({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let {group_id} = request.params
            const posts = await Post.instance().orm.findAll({
                where: {group_id},
                attributes: [
                    'id',
                    'total_likes',
                    'total_comments',
                    [sequelize.literal(`(SELECT count(*) from post_likes as PL where PL.post_id = posts.id AND PL.user_id = :userId)`), 'is_liked']
                ],
                replacements: {userId: request?.user?.id}
            });

            const postsJSON = posts.map(post => post.toJSON());
            const postIds = postsJSON.map(post => post.id);

            const postImages = await Attachment.instance().orm.findAll({
                where: {
                    instance_id: {[Op.in]: postIds},
                    instance_type: 'post',
                    media_type: 'image'
                },
                attributes: ['instance_id', 'media_url']
            });

            const postImagesJSON = postImages.map(image => image.toJSON());

            const imagesByPostId = postImagesJSON.reduce((acc, image) => {
                if (!acc[image.instance_id]) {
                    acc[image.instance_id] = [];
                }
                acc[image.instance_id].push(image.media_url);
                return acc;
            }, {});

            // Merge images with corresponding posts
            const formattedPosts = postsJSON.map(post => ({
                ...post,
                media_urls: imagesByPostId[post.id] || []
            }));

            let post_video = await Attachment.instance().orm.findAll({
                where: {
                    instance_id: {[Op.in]: postIds},
                    instance_type: 'post',
                    media_type: "video"
                },
                attributes: ['media_url']
            })

            let events = await Event.instance().orm.findAll({where: {city_group_id: group_id}})

            this.__collection = false;
            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                {
                    photos: formattedPosts,
                    videos: post_video,
                    events
                }
            );
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async getGroupChart({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await this.modal.getChartData(request)

            return await this.sendResponse(200, "Record fetched successfully", data)
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async getGroups({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = true;
            this.__collection = false

            let groups = await Group.instance().getAllGroupsForAdmin(request)
            request.query.total = groups.count

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                groups.rows
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
                "Group block status updated.",
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

    async getGroupDetails({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = false;
            this.__collection = false

            let groups = await Group.instance().getGroupDetailAdmin(request)

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                groups
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


module.exports = GroupController