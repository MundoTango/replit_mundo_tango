const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const Attachment = require("./Attachment");
const sequelize = require("sequelize");
const {Sequelize, HasMany, Op} = require("sequelize");
const User = require("../Models/User")
const UserImages = require("../Models/UserImages")
const TangoActivities = require("./TangoActivities");
const Event = require("./Event");
const Group = require("./Group");
const {BASE_URL} = require("../config/constants");
const UserTravelling = require("./UserTravelling");

class Post extends RestModel {
    constructor() {
        super("posts");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'shared_by', 'is_shared', 'original_post_id', 'group_id', 'event_id', 'activity_id', 'feeling_id',
            'content', 'total_likes', 'total_comments', 'total_shares', 'visibility',
            'location', 'country', 'city', 'latitude', 'longitude', 'status',
            'deletedAt', 'createdAt', 'updatedAt',
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'shared_by', 'is_shared', 'original_post_id', 'group_id', 'event_id', 'activity_id', 'feeling_id',
            'content', 'total_likes', 'total_comments', 'total_shares', 'visibility',
            'location', 'country', 'city', 'createdAt'
        ];
    }

    exceptUpdateField = () => {
        return ['id', 'user_id', 'createdAt'];
    }

    async indexQueryHook(query, request, params) {
        query.where = {
            user_id: request.user.id
        }
        query.include = this.includeAssociations()
    }

    async singleQueryHook(query, request, params) {
        query.include = this.includeAssociations()
    }

    includeAssociations = () => {
        return [
            {
                required: false,
                model: Attachment.instance().getModel(),
                association: new HasMany(this.getModel(), Attachment.instance().getModel(), {foreignKey: "instance_id"}),
                where: {
                    instance_type: 'post'
                }
            },
            {
                required: false,
                model: UserTravelling.instance().getModel(),
                association: new HasMany(this.getModel(), UserTravelling.instance().getModel(), {
                    sourceKey: "user_travel_id",
                    foreignKey: "user_id"
                }),
                where: {
                    status: 'active'
                }
            },
            {
                required: false,
                model: User.instance().getModel(),
                include: [{model: UserImages.instance().getModel(), attributes: ['image_url'], limit: 1},
                    {
                        required: false,
                        model: TangoActivities.instance().getModel(),
                        as: 'tango_activities'
                    }],
                attributes: ['id', 'name', 'username'],
            },
            {
                model: User.instance().getModel(),
                as: 'shared_by_user',
                attributes: ['id', 'name', 'username'],
                include: [{model: UserImages.instance().getModel(), attributes: ['image_url'], limit: 1}]
            },
            {
                model: Event.instance().getModel(),
                as: 'post_event',
                attributes: Event.instance().showColumns()
            },
            {
                model: Group.instance().getModel(),
                as: 'post_group',
                attributes: Group.instance().showColumns()
            }
        ]
    }

    async getRecordByUserId(user_id) {
        const record = await this.orm.findAll({
            where: {
                user_id: user_id,
                deletedAt: null
            },
            orderBy: ["createdAt", "desc"],
        });

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async storeRecord(request) {
        let params = request.body
        const record = await this.orm.create({
            group_id: Number(params?.group_id) || null,
            event_id: Number(params?.event_id) || null,
            activity_id: Number(params?.activity_id) || null,
            feeling_id: Number(params?.feeling_id) || null,
            content: params?.content || null,
            visibility: params?.visibility || 'public',
            location: params.location || "",
            country: params?.country || null,
            city: params?.city || null,
            latitude: Number(params?.latitude) || 0,
            longitude: Number(params?.longitude) || 0,
            total_likes: 0,
            status: params?.status,
            user_id: request?.user?.id,
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async updateRecordById(request) {
        let params = request.body
        let id = request.params.id
        const record = await this.updateRecord(request, {
            ...(params.activity_id && {activity_id: Number(params?.activity_id)}),
            ...(params.feeling_id && {feeling_id: Number(params?.feeling_id)}),
            ...(params.content && {content: params?.content}),
            ...(params.visibility && {visibility: params?.visibility}),
            ...(params.country && {country: params?.country}),
            ...(params.city && {city: params?.city}),
            ...(params.latitude && {latitude: params?.latitude}),
            ...(params.longitude && {longitude: params?.longitude}),
            ...(params.status && {status: params?.status}),
            ...(params.location && {location: params?.location}),
        }, id)

        return _.isEmpty(record) ? {} : record;
    }


    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            },
            include: this.includeAssociations()
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async updateRecordByUserId(params, user_id) {
        await this.orm.update({
            ...params
        }, {
            where: {
                user_id: user_id
            }
        })

        return this.findRecordByUserId(user_id)
    }

    async incrementLikeCount(post_id) {
        let post_find = await this.orm.findByPk(post_id)
        return post_find.increment('total_likes', {by: 1})
    }

    async decrementLikeCount(post_id) {
        let post_find = await this.orm.findByPk(post_id)
        return post_find.decrement('total_likes', {by: 1})
    }

    async incrementShareCount(post_id) {
        let post_find = await this.orm.findByPk(post_id)
        return post_find.increment('total_shares', {by: 1})
    }

    async incrementCommentCount(post_id) {
        let post_find = await this.orm.findByPk(post_id)
        return post_find.increment('total_comments', {by: 1})
    }

    async clonePost(post_id, instance_type, instance_id, caption = undefined, shared_by) {
        let params = await this.findRecordById(post_id)
        let attachments = await Attachment.instance().orm.findAll({
            where: {
                instance_id: post_id,
                instance_type: 'post'
            }
        })
        const record = await this.orm.create({
            ...(instance_type === "group" && {group_id: Number(instance_id)}),
            ...(instance_type === "event" && {event_id: Number(instance_id)}),
            ...(caption && {caption: caption}),
            activity_id: Number(params?.activity_id) || null,
            feeling_id: Number(params?.feeling_id) || null,
            content: params?.content || null,
            visibility: params?.visibility || 'public',
            location: {
                type: 'Point',
                coordinates: [Number(params?.longitude) || 0, Number(params?.latitude) || 0]
            },
            country: params?.country || null,
            city: params?.city || null,
            latitude: Number(params?.latitude) || 0,
            longitude: Number(params?.longitude) || 0,
            total_likes: 0,
            status: params?.status,
            user_id: params?.user_id,
            shared_by: shared_by,
            is_shared: 1,
            original_post_id: params?.original_post_id ? params.original_post_id : params.id
        })
        let attachmentNew = []
        for (const attachment of attachments) {
            attachmentNew.push({
                instance_type: 'post',
                instance_id: record.id,
                media_type: attachment?.media_type,
                media_url: attachment?.media_url.replace(`${BASE_URL}`, ''),
                thumbnail_url: attachment?.thumbnail_url
            })
        }
        await Attachment.instance().orm.bulkCreate(attachmentNew)


    }

    async beforeCreateHook(request, params) {
        params.text = params.text?.trim()
        params.createdAt = new Date()
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }

    async getRecordByConditions(params) {
        let record = await this.orm.findAll({
            where: params,
            include: this.includeAssociations()
        });

        return _.isEmpty(record) ? null : record.map(dt => dt.toJSON());
    }

    async findAllRecord(request) {

        let query = {...request?.query}
        let {visibility, user_id, group_id, city, event_id} = query
        console.log(event_id, "event_id")
        let where = {}
        if (group_id) where['group_id'] = group_id
        if (user_id) where['user_id'] = user_id
        if (city) where['city'] = city
        if (event_id) where['event_id'] = event_id

        switch (visibility) {
            case 'public':
                where['visibility'] = 'public'
                break;
            case 'friend':
                where['visibility'] = 'friend'
                break;
            case 'private':
                where['visibility'] = 'private'
                where['user_id'] = request?.user?.id
                break;
            default:
                // Handle case when visibility is undefined or invalid, if necessary
                break;
        }

        let offset = 0
        let limit = 0

        if (query?.is_paginated == 1) {
            let page = Number(query?.page) || 1
            limit = Number(query?.limit) || 10
            offset = (Number(page) - 1) * limit
        }

        let include = []

        include.push([
            sequelize.literal(`(SELECT count(*) from post_likes as PL where PL.post_id = posts.id AND PL.user_id = :userId)`), 'is_liked'
        ])
        include.push([
            sequelize.literal(`(SELECT COUNT(*) FROM hide_posts WHERE user_id = :userId AND post_id = posts.id )`), 'is_hide'
        ])
        include.push([
            sequelize.literal(`(SELECT COUNT(*) FROM save_posts WHERE user_id = :userId AND post_id = posts.id )`), 'is_saved'
        ])
        include.push([
            sequelize.literal(`(
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM group_members 
                    WHERE user_id = :userId 
                    AND group_id = posts.group_id 
                    AND deletedAt IS NULL
                ) THEN 1 
                ELSE 0 
            END)`), 'in_group'
        ])
        include.push([
            sequelize.literal(`(
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM event_participants 
                    WHERE user_id = :userId 
                    AND group_id = posts.event_id 
                    AND deletedAt IS NULL
                ) THEN 1 
                ELSE 0 
            END
            )`), 'in_event'
        ])
        include.push([sequelize.literal(`(
                         CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM friends 
                                WHERE 
                                    user_id = :userId AND friend_id = posts.user_id AND status = 'pending' AND deletedAt IS NULL
                            ) THEN 1
                            WHEN EXISTS (
                                SELECT 1 
                                FROM friends 
                                WHERE 
                                    (user_id = :userId AND friend_id = posts.user_id AND status = 'connected' AND deletedAt IS NULL) 
                                    OR (user_id = posts.user_id AND friend_id = :userId AND status = 'connected' AND deletedAt IS NULL)
                            ) THEN 2
                            WHEN EXISTS (
                                SELECT 1 
                                FROM friends 
                                WHERE 
                                    user_id = posts.user_id AND friend_id = :userId AND status = 'pending' AND deletedAt IS NULL
                            ) THEN 3
                            ELSE 0
                        END
                    )`),
            'is_friend_request'])

        if (visibility == 'friend') {
            include.push([
                sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM friends 
                        WHERE 
                        (user_id = :userId AND friend_id = posts.user_id AND status="connected") 
                        OR (user_id = posts.user_id AND friend_id = :userId AND status="connected")
                        
                    )`),
                'is_friend'
            ])
        }

        let attributes = {
            include: include
        };

        let having = sequelize.and(
            sequelize.where(
                sequelize.literal(`(SELECT COUNT(*) FROM hide_posts WHERE user_id = :userId AND post_id = posts.id)`),
                {
                    [Op.eq]: 0
                },
            ),
            sequelize.where(
                sequelize.literal(`(SELECT COUNT(*) FROM blocked_users WHERE user_id = :userId AND blocked_user_id = posts.user_id)`),
                {
                    [Op.eq]: 0
                }
            ),
            ...(query?.visibility == 'friend' ? [
                sequelize.or(
                    {user_id: request.user.id}, // Include user's own posts
                    sequelize.where(
                        sequelize.literal(`(SELECT COUNT(*)
                        FROM friends
                        WHERE
                        (user_id = :userId AND friend_id = posts.user_id AND status = "connected")
                        OR (user_id = posts.user_id AND friend_id = :userId AND status = "connected"))`),
                        {[Op.gt]: 0}
                    )
                )
            ] : [])
        )
        console.log(having, "99")


        let record = await this.orm.findAll({
            attributes,
            where,
            include: this.includeAssociations(),
            replacements: {userId: request?.user?.id}, // Avoid SQL injection by using replacements
            ...(query?.is_paginated == 1 && {offset: Number(offset), limit: Number(limit)}),
            having: having,
            order: [['createdAt', 'DESC']]
        });


        // record.rows = record?.rows.map(dt => dt.toJSON())
        record = record?.map(dt => dt.toJSON())

        console.log(record, "recordrecord")

        let count = await this.orm.findAll({
            where: {...where, deletedAt: null},
            attributes,
            include: this.includeAssociations(),
            replacements: {userId: request?.user?.id},
            having: having
        })

        return _.isEmpty(record) ? [] : {rows: record, count: count.length};
    }

    async getAllPostForAdmin(request) {
        let page = parseInt(request.query.page) || 1
        let limit = parseInt(request.query.limit) || 10
        let offset = (page - 1) * limit

        return this.orm.findAndCountAll({
            where: {
                deletedAt: null,
                ...(request.query.search && {
                    content: {
                        [Op.like]: `%${request.query.search}%`
                    }
                }),
                ...(request.query.post_type && {post_type: request.query.post_type})
            },
            include: this.includeAssociations(),
            offset: offset,
            limit
        })
    }
}

module.exports = Post;
