const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")
const Attachment = require("./Attachment");
const {HasMany, Op, Sequelize} = require("sequelize");
const User = require("./User");
const UserImages = require("./UserImages");
const sequelize = require("sequelize");

class Friend extends RestModel {
    constructor() {
        super("friends");
    }

    getFields = () => {
        return ['id', 'friend_id', 'user_id', 'have_we_danced', 'city_we_meet', 'when_did_we_meet', 'event_we_meet', 'connect_reason', 'notes', 'status', 'createdAt', 'updatedAt'];

    }

    showColumns = () => {
        return ['id', 'friend_id', 'user_id', 'have_we_danced', 'city_we_meet', 'when_did_we_meet', 'event_we_meet', 'connect_reason', 'notes', 'status', 'createdAt', 'updatedAt'];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    getAssociationInclude = () => {
        return [
            {
                required: false,
                model: Attachment.instance().getModel(),
                association: new HasMany(this.getModel(), Attachment.instance().getModel(), {foreignKey: "instance_id"}),
                where: {
                    instance_type: 'friend'
                }
            },
            {
                required: false,
                model: User.instance().getModel(),
                as: 'friend_user',
                attributes: ['id', 'name', 'username', 'email'],
                include: [
                    {model: UserImages.instance().getModel()}
                ]
            },
            {
                required: false,
                model: User.instance().getModel(),
                as: 'friend',
                attributes: ['id', 'name', 'username', 'email'],
                include: [
                    {model: UserImages.instance().getModel()}
                ]
            }
        ]
    }

    async createRecord(request) {
        let params = request.body
        const record = await this.orm.create({
            user_id: request.user.id,
            friend_id: Number(params?.friend_id),
            have_we_danced: params?.have_we_danced,
            city_we_meet: params?.city_we_meet,
            when_did_we_meet: Date(params?.when_did_we_meet),
            event_we_meet: params?.event_we_meet,
            connect_reason: params?.connect_reason,
            sender_notes: params?.sender_notes,
            // receiver_notes: params?.receiver_notes
        })
        return _.isEmpty(record) ? {} : record;
    }

    async getRecordByCondition(request, where, limit = undefined, offset = undefined) {
        const record = await this.orm.findAll({
            where: where,
            include: [
                {
                    required: false,
                    model: Attachment.instance().getModel(),
                    association: new HasMany(this.getModel(), Attachment.instance().getModel(), {foreignKey: "instance_id"}),
                    where: {
                        instance_type: 'friend'
                    }
                },
                {
                    required: false,
                    model: User.instance().getModel(),
                    as: 'friend_user',
                    ...(request.query.event_id && {
                        attributes: [
                            'id', 'name', 'username', 'email',
                            [sequelize.literal(`(
                                 CASE 
                                    WHEN EXISTS (
                                        SELECT 1 
                                        FROM event_participants 
                                        WHERE 
                                            user_id=friend_user.id AND event_id=${request.query.event_id} AND status='going'
                                    ) THEN 1
                                    WHEN EXISTS (
                                        SELECT 1 
                                        FROM event_participants 
                                        WHERE 
                                            user_id=friend_user.id AND event_id=${request.query.event_id} AND status='interested'
                                    ) THEN 2
                                    WHEN EXISTS (
                                        SELECT 1 
                                        FROM event_participants 
                                        WHERE 
                                            user_id=friend_user.id AND event_id=${request.query.event_id} AND status='invited'
                                    ) THEN 3
                                    ELSE 0
                                END
                               
                            )`), 'is_in_event']
                        ]
                    }),
                    ...(!request.query.event_id && {
                        attributes: ['id', 'name', 'username', 'email']
                    }),
                    include: [
                        {model: UserImages.instance().getModel()},
                        {
                            required: false,
                            model: TangoActivities.instance().getModel(),
                            as: 'tango_activities'
                        }
                    ],
                },
                {
                    required: false,
                    model: User.instance().getModel(),
                    as: 'friend',
                    attributes: ['id', 'name', 'username', 'email', 'image_url'],
                    ...(request.query.event_id && {
                        attributes: [
                            'id', 'name', 'username', 'email',
                            [sequelize.literal(`(
                                 CASE 
                                    WHEN EXISTS (
                                        SELECT 1 
                                        FROM event_participants 
                                        WHERE 
                                            user_id=friend.id AND event_id=${request.query.event_id} AND status='going'
                                    ) THEN 1
                                    WHEN EXISTS (
                                        SELECT 1 
                                        FROM event_participants 
                                        WHERE 
                                            user_id=friend.id AND event_id=${request.query.event_id} AND status='interested'
                                    ) THEN 2
                                    WHEN EXISTS (
                                        SELECT 1 
                                        FROM event_participants 
                                        WHERE 
                                            user_id=friend.id AND event_id=${request.query.event_id} AND status='interested'
                                    ) THEN 3
                                    ELSE 0
                                END
                               
                            )`), 'is_in_event']
                        ]
                    }),
                    ...(!request.query.event_id && {
                        attributes: ['id', 'name', 'username', 'email']
                    }),
                    include: [
                        {model: UserImages.instance().getModel()},
                        {
                            required: false,
                            model: TangoActivities.instance().getModel(),
                            as: 'tango_activities'
                        }
                    ]
                }
            ],
            limit: limit,
            offset: offset,
            having: sequelize.literal(`
                    (SELECT COUNT(*)
                     FROM blocked_users
                     WHERE
                     (blocked_users.user_id = friends.user_id AND blocked_users.blocked_user_id = friends.friend_id AND deletedAt IS NULL)
                     OR
                     (blocked_users.user_id = friends.friend_id AND blocked_users.blocked_user_id = friends.user_id AND deletedAt IS NULL) 
                    ) < 1
                `)
        });

        return _.isEmpty(record) ? [] : record.map(dt => dt.toJSON());
    }

    removeUserObject(request, data) {
        let user_id = request?.user?.id
        let mutated_data = []
        for (const obj of data) {
            if (user_id == obj?.friend?.id) {
                obj['friend'] = obj?.friend_user
            } else if (user_id == obj?.friend_user?.id) {
                obj['friend'] = obj?.friend
            }
            delete obj['friend_user']

            mutated_data.push(obj)
        }

        return mutated_data
    }

    async getRecordCountByConditions(where) {
        return this.orm.count({where: where})
    }

    async getOneRecordByCondition(where) {
        const record = await this.orm.findOne({
            where: where,
            include: this.getAssociationInclude()
        });

        return _.isEmpty(record) ? [] : record.toJSON();
    }

    async storeBulkRecord(params) {
        const record = await this.orm.bulkCreate(params, {raw: true})
        return _.isEmpty(record) ? {} : record;
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            },
            include: this.getAssociationInclude()
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async getUserFriend(user_id) {
        return this.orm.findAll({
            where: {
                [Op.or]: [{user_id: user_id}, {friend_id: user_id}]
            },
            include: [
                {
                    required: false,
                    model: User.instance().getModel(),
                    as: 'friend_user',
                    attributes: ['id', 'name', 'username', 'email'],
                    include: [
                        {model: UserImages.instance().getModel()}
                    ]
                },
                {
                    required: false,
                    model: User.instance().getModel(),
                    as: 'friend',
                    attributes: ['id', 'name', 'username', 'email'],
                    include: [
                        {model: UserImages.instance().getModel()}
                    ]
                }
            ],
            limit: 5
        })
    }

    async destroyRecord(id) {
        const record = await this.orm.destroy({
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async updateRecord(id, params) {
        const record = await this.orm.update(params, {
            where: {
                id: id
            }
        })


        return _.isEmpty(record) ? null : record;
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
}

module.exports = Friend;
