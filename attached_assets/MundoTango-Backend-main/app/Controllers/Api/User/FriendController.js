const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const Attachment = require('../../../Models/Attachment')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const {Op} = require("sequelize");
const Friend = require("../../../Models/Friend");
const GroupMember = require("../../../Models/GroupMember");
const UserTravel = require("../../../Models/UserTravelling");
const EventParticipants = require("../../../Models/EventParticipants");
const sequelize = require("sequelize");
const {delimiter} = require("path");
const Group = require("../../../Models/Group");
const Notification = require("../../../Models/Notification");

class FriendController extends RestController {

    constructor() {
        super('Friend')
        this.resource = 'Friend';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async sendFriendRequest({request, response}) {
        try {
            // this.__collection = false
            this.__is_paginate = false
            this.request = request;
            this.response = response;

            let recordFind = await this.modal.getRecordByCondition({
                [Op.or]: [
                    {
                        user_id: request?.user.id,
                        friend_id: request.body?.friend_id
                    },
                    {
                        user_id: request.body?.friend_id,
                        friend_id: request?.user.id
                    }
                ],
                status: 'pending'
            })

            if (recordFind.length > 0) return this.sendError(
                "Request already sent",
                {},
                400
            )

            let recordCreate = await this.modal.createRecord(request)

            let attachment_arr = []
            const fileObject = this.request.files;
            for (const obj of fileObject) {
                const image = await FileHandler.doUpload(fileObject[0], getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                const image_url = UPLOAD_DIRECTORY.POST + "/" + image
                attachment_arr.push({
                    instance_type: 'friend',
                    instance_id: recordCreate?.id,
                    media_type: 'image',
                    media_url: image_url
                })
            }

            await Attachment.instance().storeBulkRecord(attachment_arr)

            let friend_request = await this.modal.findRecordById(recordCreate?.id)

            // invitation event
            Notification.instance().sendNotification(request, request?.user?.id, request.body.user_id, "friend-request", `Friend request`, `${request.user.name} has sent you a friend request. `, request?.user?.image_url, request.body?.friend_id)

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record added successfully.",
                friend_request
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

    async getConnectionRequest({request, response}) {
        try {
            // this.__collection = false
            this.request = request;
            this.response = response;

            let query = {...request?.query}
            let page = Number(query?.page) || 1
            let limit = Number(query?.page) || 10

            let offset = (page - 1) * limit

            let find_record = await this.modal.getRecordByCondition({
                status: 'pending',
                friend_id: request?.user?.id
            }, limit, offset)

            this.request.query.total = await this.modal.getRecordCountByConditions({
                status: 'pending',
                friend_id: request?.user?.id
            })

            this.__is_paginate = true;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                find_record
            )
        } catch (err) {
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

    async getFriendshipCard({request, response}) {
        try {
            // this.__collection = false
            this.request = request;
            this.response = response;

            let find_record = await this.modal.getOneRecordByCondition({
                [Op.or]: [
                    {user_id: request?.user?.id, friend_id: parseInt(request.params.id)},
                    {friend_id: request?.user?.id, user_id: parseInt(request.params.id)}
                ]
            })

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                find_record
            )
        } catch (err) {
            return this.sendError(
                "Internal server error. Please try again later.",
                err?.message,
                500
            )
        }
    }

    async updateStatus({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let request_id = request?.params.id

            await this.modal.updateRecord(request_id, {
                status: request.body.status,
                receiver_notes: request.body?.receiver_notes
            })

            let updated_record = await this.modal.findRecordById(request_id)

            if (request.body.status == "connected") {
                // invitation event
                Notification.instance().sendNotification(request, request?.user?.id, updated_record.user_id, "friend-request", `Friend request`, `${request.user.name} has accepted your friend request. `, request?.user?.image_url, request?.user?.id)
            }

            this.__is_paginate = false;
            // this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                updated_record
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async getMyFriends({request, response}) {
        this.request = request;
        this.response = response;

        let find_records = await this.modal.getRecordByCondition(request, {
            [Op.or]: [
                {friend_id: request.user.id},
                {user_id: request.user.id}
            ],
            status: 'connected'
        })

        find_records = this.modal.removeUserObject(request, find_records)

        this.__is_paginate = false;
        this.__collection = false
        return await this.sendResponse(
            200,
            "Record fetched successfully.",
            find_records
        )
    }

    async getCommonThings({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let {friend_id} = request.params

            // mutual friend
            let mutual_Friend = await Friend.instance().orm.findAndCountAll({
                attributes: ['friend_id'],
                include: [
                    {
                        model: Friend.instance().getModel(),
                        as: 'mutual_friend',
                        required: true,
                        on: {
                            friend_id: sequelize.col('friends.friend_id')
                        },
                        where: {user_id: friend_id},
                    },
                    {
                        model: User.instance().getModel(),
                        as: 'friend',
                        attributes: ['image_url', 'username', 'email', 'id']
                    }

                ],
                where: {user_id: request.user.id},
                limit: 2
            });

            let mutual_groups = await GroupMember.instance().orm.findAndCountAll({
                attributes: ['group_id'], // Ensure unique group IDs
                include: [
                    {
                        model: GroupMember.instance().getModel(), // Self-join on GroupMember
                        as: 'mutual_group', // Alias for the other user's membership
                        required: true,
                        on: {
                            group_id: sequelize.col('mutual_group.group_id')
                        },
                        where: {
                            user_id: friend_id,
                            status: 'joined', // Filter for the friend's group memberships
                            deletedAt: null
                        },
                    },
                    {
                        model: User.instance().getModel(),
                        as: 'user',
                        attributes: ['image_url', 'username', 'email', 'id']
                    },
                    {
                        model: Group.instance().getModel(),
                        as: 'group',
                        required: true
                    }
                ],
                where: {
                    user_id: request.user.id, // Filter for the requesting user's group memberships
                    status: 'joined', // Make sure the requesting user has joined the group
                    deletedAt: null
                },
                distinct: true
            });

            let uniqueGroups = [
                ...new Map(mutual_groups.rows.map(item => [item.group_id, item])).values()
            ]

            let mutual_travelling = await UserTravel.instance().orm.findAndCountAll({
                attributes: ['user_id'], // Fetch only the group IDs
                include: [
                    {
                        model: UserTravel.instance().getModel(), // Self-join on GroupMember
                        as: 'mutual_travel', // Alias for the other user's membership
                        required: true,
                        on: {
                            event_type_id: sequelize.col('user_travels.event_type_id') // Ensure both users are in the same group
                        },
                        where: {user_id: friend_id}, // Filter for the friend's group memberships
                        include: [
                            {
                                model: User.instance().getModel(),
                                as: 'user',
                                attributes: ['image_url', 'username', 'email', 'id']
                            }
                        ]
                    },

                ],
                where: {user_id: request.user.id}, // Filter for the requesting user's group memberships
                distinct: true
            });
            let uniqueMutualTravelling = [
                ...new Map(mutual_travelling.rows.map(item => [item.id, item])).values()
            ]

            let mutual_event = await EventParticipants.instance().orm.findAndCountAll({
                attributes: ['user_id'], // Fetch only the group IDs
                include: [
                    {
                        model: EventParticipants.instance().getModel(), // Self-join on GroupMember
                        as: 'mutual_event', // Alias for the other user's membership
                        required: true,
                        on: {
                            group_id: sequelize.col('event_participants.event_id') // Ensure both users are in the same group
                        },
                        where: {user_id: friend_id}, // Filter for the friend's group memberships
                        include: [
                            {
                                model: User.instance().getModel(),
                                as: 'user',
                                attributes: ['image_url', 'username', 'email', 'id']
                            }
                        ]
                    },
                ],
                where: {user_id: request.user.id}, // Filter for the requesting user's group memberships
                distinct: true
            });

            let uniqueMutualEvent = [
                ...new Map(mutual_event.rows.map(item => [item.user_id, item])).values()
            ]

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                {
                    mutual_Friend,
                    mutual_groups: {rows: uniqueGroups.slice(0, 2), count: uniqueGroups.length},
                    mutual_travelling: {rows: uniqueMutualTravelling.slice(0, 2), count: uniqueMutualTravelling.length},
                    mutual_event: {rows: uniqueMutualEvent.slice(0, 2), count: uniqueMutualEvent.length}
                }
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


module.exports = FriendController