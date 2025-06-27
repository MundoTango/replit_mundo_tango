const _ = require("lodash")
const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath} = require("../../../Helper");
const User = require('../../../Models/User')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const EventParticipants = require("../../../Models/EventParticipants");
const EventActivity = require("../../../Models/EventActivity");
const GroupMember = require("../../../Models/GroupMember");
const Invite = require("../../../Models/Invite");
const {Op, Sequelize} = require("sequelize");
const sequelize = require("sequelize");
const Post = require("../../../Models/Post");
const Attachment = require("../../../Models/Attachment");
const Event = require("../../../Models/Event");
const Notification = require("../../../Models/Notification");
const Group = require("../../../Models/Group");

class EventController extends RestController {

    constructor() {
        super('Event')
        this.resource = 'Event';
        // this.__collection = false
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async addEvent({request, response}) {
        try {
            this.__collection = false
            this.__is_paginate = false

            this.request = request;
            this.response = response;

            let body = request.body

            let rules = {
                "name": 'required',
                "event_type_id": 'required',
                "start_date": 'required',
                "end_date": 'required',
                "location": 'required',
                "city": 'required',
                "country": 'required',
                // "latitude": 'required',
                // "longitude": 'required',
                // "visibility": 'required',
                // "description": 'required',
                // "about_space": 'required',
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;


            const fileObject = this.request.files;
            let image_url = ""
            if (fileObject.length > 0) {
                const image = await FileHandler.doUpload(fileObject[0], getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                image_url = UPLOAD_DIRECTORY.POST + "/" + image
            }

            let recordCreate = await this.modal.createRecord({
                user_id: request?.user?.id,
                image_url: image_url,
                event_type_id: body?.event_type_id,
                ...(body?.city_group_id && {city_group_id: body?.city_group_id}),
                name: body?.name,
                start_date: body?.start_date,
                end_date: body?.end_date,
                location: body?.location,
                city: body?.city,
                country: body?.country,
                latitude: Number(body?.latitude) || 0.0,
                longitude: Number(body?.longitude) || 0.0,
                visibility: body?.visibility || "public",
                status: body?.status || 'active',
                ...(body?.description && {description: body?.description}),
                ...(body?.about_space && {about_space: body?.about_space}),
            })


            let participants_arr = []
            let non_tango_activities_arr = []

            participants_arr.push({
                event_id: recordCreate?.id,
                user_id: Number(request.user?.id),
                user_type: 'admin',
                status: 'going'
            })
            if (body?.participants && body?.participants.length > 0) {
                let participants = [...body?.participants]
                for (const participant of participants) {
                    participants_arr.push({
                        event_id: recordCreate?.id,
                        user_id: Number(participant?.user_id),
                        user_type: participant?.user_type
                    })
                }
            }

            await EventParticipants.instance().storeBulkRecord(participants_arr)


            if (body?.non_tango_activities && body?.non_tango_activities.length > 0) {
                let non_tango_activities = [...body?.non_tango_activities]
                for (const non_tango_activity of non_tango_activities) {
                    non_tango_activities_arr.push({
                        event_id: recordCreate?.id,
                        non_tango_activity_id: non_tango_activity
                    })
                }

                await EventActivity.instance().storeBulkRecord((non_tango_activities_arr))
            }

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

    async updateEvent({request, response}){
        try {
            this.__collection = false
            this.__is_paginate = false

            this.request = request;
            this.response = response;

            let body = request.body

            const fileObject = this.request.files;
            let image_url = null
            if (fileObject.length > 0) {
                const image = await FileHandler.doUpload(fileObject[0], getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                image_url = UPLOAD_DIRECTORY.POST + "/" + image
            }

            await this.modal.orm.update({
                ...(image_url && {image_url: image_url}),
                ...(body?.event_type_id && {event_type_id: body?.event_type_id}),
                ...(body?.city_group_id && {city_group_id: body?.city_group_id}),
                ...(body?.name && {name: body?.name}),
                ...(body?.start_date && {start_date: body?.start_date}),
                ...(body?.end_date && {end_date: body?.end_date}),
                ...(body?.location && {location: body?.location}),
                ...(body?.city && {city: body?.city}),
                ...(body?.country && {country: body?.country}),
                ...(body?.latitude && {latitude: Number(body?.latitude)}),
                ...(body?.longitude && {longitude: Number(body?.longitude)}),
                ...(body?.visibility && {visibility: body?.visibility}),
                ...(body?.status && {status: body?.status}),
                ...(body?.description && {description: body?.description}),
                ...(body?.about_space && {about_space: body?.about_space}),
            }, {
                where: {
                    id: request.params.id
                }
            })

            let participants_arr = []
            let non_tango_activities_arr = []

            if (body?.participants && body?.participants.length > 0) {
                let participants = [...body?.participants]
                for (const participant of participants) {
                    participants_arr.push({
                        event_id: parseInt(request.params?.id),
                        user_id: parseInt(participant?.user_id),
                        user_type: participant?.user_type
                    })
                }
                await EventParticipants.instance().storeBulkRecord(participants_arr)
            }

            if (body?.non_tango_activities && body?.non_tango_activities.length > 0) {
                let non_tango_activities = [...body?.non_tango_activities]
                for (const non_tango_activity of non_tango_activities) {
                    non_tango_activities_arr.push({
                        event_id: parseInt(request.params?.id),
                        non_tango_activity_id: non_tango_activity
                    })
                }

                await EventActivity.instance().storeBulkRecord((non_tango_activities_arr))
            }

            this.__is_paginate = false;

            let recordCreate = await Event.instance().getRecordByCondition(request, {
                id: request.params.id
            })

            return await this.sendResponse(
                200,
                "Record updated successfully.",
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

    async showAllEvents({request, response}) {
        try {
            this.__collection = false
            this.request = request;
            this.response = response;

            let find_record = await this.modal.getRecordByCondition(request, request.query)

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
            this.__collection = false
            this.request = request;
            this.response = response;

            await EventParticipants.instance().orm.destroy({
                where: {
                    event_id: request.params.id
                },
                force: true
            })

            await EventActivity.instance().orm.destroy({
                where: {
                    event_id: request.params.id
                },
                force: true
            })

            await Post.instance().orm.destroy({
                where: {
                    event_id: request.params.id
                }
            })

            await Event.instance().orm.destroy({
                where: {
                    id: request.params.id
                }
            })

            this.__is_paginate = false;
            return this.sendResponse(
                200,
                "Record deleted successfully.",
                {}
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


    async requestToJoinEvent({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let rules = {
                "event_id": 'required'
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let find_record = await GroupMember.instance().getRecordByCondition({
                group_id: request.body?.group_id,
                user_id: request?.user?.id
            })

            if (find_record[0]?.status === "joined") return this.sendError("You already in this group.", {}, 500)
            if (find_record[0]?.status === "requested") return this.sendError("You already have requested to join this group.", {}, 500)

            let data = await GroupMember.instance().createRecord({
                group_id: request?.body?.group_id,
                user_id: request?.user?.id,
                status: 'requested',
                user_type: 'general'
            })

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

    async inviteToEvent({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let rules = {
                "event_id": 'required',
                "user_id": 'required'
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let find_record = await EventParticipants.instance().getRecordByCondition({
                event_id: request.body?.event_id,
                user_id: request?.body?.user_id
            })

            if (find_record.length > 0) {
                return this.sendError(
                    "You have already invited user to join this event.",
                    {},
                    400
                )
            }

            let data = await EventParticipants.instance().createRecord({
                event_id: request?.body?.event_id,
                user_id: request?.body?.user_id,
                status: 'invited',
                user_type: 'general'
            })

            await Invite.instance().storeRecord({
                invite_from_id: request?.user?.id,
                invite_to_id: request.body.user_id,
                instance_type: 'event',
                instance_id: request?.body?.event_id,
                status: 'invited'
            })

            // invitation event
            Notification.instance().sendNotification(request, request?.user?.id, request.body.user_id, "invite-event", `Event invitation`, `${request.user.name}  invited you in an event. `, request?.user?.image_url, request?.body?.event_id)

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                data
            )
        } catch (e) {
            console.log(e)
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

            let data = await EventParticipants.instance().getRecordByCondition({
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

            await EventParticipants.instance().updateRecord(request.params, {
                status: status
            }, request.params.id)

            let data = await EventParticipants.instance().findRecordById(request?.params?.id)

            await Invite.instance().updateRecord(request, {status}, {
                invite_to_id: request?.user?.id,
                instance_type: 'group',
                instance_id: data?.event_id
            })

            this.__is_paginate = false;
            this.__collection = false
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

    async upcomingEvent({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let upcoming_event = await this.modal.upcoming_event_timeline(request)
            return await this.sendResponse(
                200,
                "Status updated successfully.",
                upcoming_event
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async interestedEvent({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let rules = {
                "event_id": 'required',
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let find_record = await EventParticipants.instance().getRecordByCondition({
                event_id: request.body?.event_id,
                user_id: request?.user?.id,
            })

            if (find_record[0]?.status === "requested") return this.sendError("You are already going in this event.", {}, 400)
            if (find_record[0]?.status === "interested") return this.sendError("You are already interested in this event.", {}, 400)

            let data = await EventParticipants.instance().createRecord({
                event_id: request?.body?.event_id,
                user_id: request?.user?.id,
                status: 'interested',
                user_type: "general"
            })

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Request added successfully.",
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

    async goingEvent({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let rules = {
                "event_id": 'required',
            }
            let validator = await validateAll(request.body, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let find_record = await EventParticipants.instance().getRecordByCondition({
                event_id: request.body?.event_id,
                user_id: request?.user?.id,
            })

            if (find_record[0]?.status === "requested") return this.sendError("You are already going in this event.", {}, 400)
            if (find_record[0]?.status === "interested") return this.sendError("You are already interested in this event.", {}, 400)

            let data = await EventParticipants.instance().createRecord({
                event_id: request?.body?.event_id,
                user_id: request?.user?.id,
                status: 'going',
                user_type: "general"
            })

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Request added successfully.",
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

    async eventMembers({request, response}) {
        try {
            this.request = request;
            this.response = response;


            let hosts = await EventParticipants.instance().orm.findAll({
                where: {user_type: 'host', event_id: request.params.event_id},
                include: [
                    {
                        model: User.instance().getModel(),
                        attributes: ['name', 'username', 'email', 'id', 'image_url']
                    }
                ]
            })

            let co_hosts = await EventParticipants.instance().orm.findAll({
                where: {user_type: 'co-host', event_id: request.params.event_id},
                include: [
                    {
                        model: User.instance().getModel(),
                        attributes: ['name', 'username', 'email', 'id', 'image_url']
                    }
                ]
            })
            let general_hosts = await EventParticipants.instance().orm.findAll({
                where: {event_id: request.params.event_id, user_type: {[Op.notIn]: ['host', 'general', 'co-host']}},
                include: [
                    {
                        model: User.instance().getModel(),
                        attributes: ['name', 'username', 'email', 'id', 'image_url']
                    }
                ]
            })
            let guest_friends = await EventParticipants.instance().orm.findAll({
                where: {
                    user_type: 'general',
                    event_id: request.params.event_id,
                    status: {[Op.in]: ['going', 'interested']}
                },
                include: [
                    {
                        model: User.instance().getModel(),
                        attributes: ['name', 'username', 'email', 'id', 'image_url']
                    }
                ],
                having: sequelize.literal(`
                    (SELECT COUNT(*)
                     FROM friends
                     WHERE
                     (friends.user_id = :userId AND friends.friend_id = user.id AND status = "connected")
                     OR
                     (friends.user_id = user.id AND friends.friend_id = :userId AND status = "connected")
                    ) > 0
                `),
                replacements: {userId: request?.user?.id} // Avoid SQL injection with replacements
            });
            let guests = await EventParticipants.instance().orm.findAll({
                where: {event_id: request.params.event_id, user_type: 'general', status: {[Op.in]: ['going', 'interested']}},
                include: [
                    {
                        model: User.instance().getModel(),
                        attributes: ['name', 'username', 'email', 'id', 'image_url']
                    }
                ],
                having: sequelize.literal(`
                    (SELECT COUNT(*)
                     FROM friends
                     WHERE
                     (friends.user_id = :userId AND friends.friend_id = user.id AND status = "connected")
                     OR
                     (friends.user_id = user.id AND friends.friend_id = :userId AND status = "connected")
                    ) < 1
                `),
                replacements: {userId: request?.user?.id} // Avoid SQL injection with replacements
            })

            let data = {
                hosts, general_hosts, guests, guest_friends, co_hosts
            }

            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Request added successfully.",
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

    async getEventChart({request, response}) {
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

    async getEventTimeLine({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let {event_id} = request.params
            const posts = await Post.instance().orm.findAll({
                where: {event_id},
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

            // let events = await Event.instance().orm.findAll({where: {city_group_id: event_id}})

            this.__collection = false;
            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                {
                    photos: formattedPosts,
                    videos: post_video,
                    // events
                }
            );
        } catch (e) {
            return this.sendError("Internal server error. Please try again later.", e?.message, 500)
        }
    }

    async getEvents({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = true;
            this.__collection = false

            let events = await this.modal.getAllEventsForAdmin(request)
            request.query.total = events.count

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                events.rows
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


    async getEventDetails({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = false;
            this.__collection = false

            let events = await this.modal.getEventDetailAdmin(request)

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                events
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

    async eventWeMeet({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let rules = {
                "friend_id": 'required'
            }
            let validator = await validateAll(request.params, rules,);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let events = await this.modal.getEventWeMeet(request)

            return await this.sendResponse(
                200,
                "Record fetched successfully.",
                events
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


module.exports = EventController