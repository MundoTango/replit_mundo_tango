const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const Attachment = require("./Attachment");
const sequelize = require("sequelize");
const {Sequelize, HasMany, Op} = require("sequelize");
const User = require("../Models/User")
const UserImages = require("../Models/UserImages")
const PostComment = require("../Models/PostComment")
const TangoActivities = require("./TangoActivities");

class Invite extends RestModel {
    constructor() {
        super("invites");
    }

    getFields = () => {
        return ['id', 'invite_from_id', 'invite_to_id', 'instance_type', 'instance_id', 'status', 'deletedAt', 'createdAt', 'updatedAt'];
    }

    showColumns = () => {
        return ['id', 'invite_from_id', 'invite_to_id', 'instance_type', 'instance_id', 'status', 'deletedAt', 'createdAt', 'updatedAt'];
    }

    exceptUpdateField = () => {
        return ['id'];
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
                model: User.instance().getModel(),
                include: [{model: UserImages.instance().getModel(), attributes: ['image_url'], limit: 1},
                    {
                        required: false,
                        model: TangoActivities.instance().getModel(),
                        as: 'tango_activities'
                    }],
                attributes: ['id', 'name', 'username'],
            },

        ]
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

    async storeRecord(params) {
        const record = await this.orm.create(params)

        return _.isEmpty(record) ? {} : record.toJSON();
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

    async updateRecord(request, params, cond) {
        await this.orm.update({
            ...params
        }, {
            where: cond
        })

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

    async showRecordByCondition(params) {
        let record = await this.orm.findOne({
            where: params,
            include: this.includeAssociations()
        });

        return _.isEmpty(record) ? null : record.toJSON();
    }

}

module.exports = Invite;
