const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const Attachment = require("./Attachment");
const sequelize = require("sequelize");
const {Sequelize, HasMany} = require("sequelize");
const User = require("../Models/User")
const UserImages = require("../Models/UserImages")

class PostComment extends RestModel {
    constructor() {
        super("post_comments");
    }

    getFields = () => {
        return ['id', 'parent_id', 'user_id', 'post_id', 'comment'];
    }

    showColumns = () => {
        return ['id', 'parent_id', 'user_id', 'post_id', 'comment', 'createdAt', 'updatedAt', 'deletedAt'];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    includeAssociations = () => {
        return [
            {
                model: this.getModel(),  // Assuming this is the model for replies
                as: 'replies',
                attributes: {
                    include: [[
                        sequelize.literal(`(SELECT COUNT(*) FROM post_comment_likes AS PCL WHERE PCL.comment_id = replies.id AND PCL.user_id = :userId)`),
                        'is_liked'
                    ]]
                },
                include: [
                    {
                        model: User.instance().getModel(),
                        include: [{model: UserImages.instance().getModel(), attributes: ['image_url']}],
                        attributes: ['name', 'username', 'email']
                    }
                ]
            },
            {
                model: User.instance().getModel(),
                include: [{model: UserImages.instance().getModel(), attributes: ['image_url']}],
                attributes: [
                    'name', 'username', 'email'
                ]
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
            post_id: params?.post_id,
            user_id: request?.user?.id,
            comment: params?.comment,
            parent_id: params.parent_id
        })
        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            },
            // include: this.includeAssociations(),
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async updateRecord(id, params) {
        return this.orm.update({
            ...params
        }, {
            where: {
                id: id
            }
        })

    }

    async findAllRecords(query) {
        return this.orm.findAll(query)
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

    indexQueryHook(query, request, params) {
        query.where = {
            user_id: request.user.id
        }
        query.include = this.includeAssociations()
    }


    async getRecordByConditions(request, params, limit = undefined, offset = undefined) {
        let record = await this.orm.findAll({
            attributes: {
                include: [[
                    sequelize.literal(`(SELECT COUNT(*) from post_comment_likes as PCL where PCL.comment_id = post_comments.id AND PCL.user_id = :userId)`), 'is_liked'
                ]]
            },
            where: params,
            include: this.includeAssociations(),
            limit: limit,
            offset: offset,
            replacements: {userId: request?.user?.id}, // Avoid SQL injection by using replacements
        });
        return _.isEmpty(record) ? [] : record.map(dt => dt.toJSON());
    }

    async getRecordCounts(query) {
        return this.orm.count({
            where: query
        })
    }

    incrementLikeCount(comment_id) {
        return this.orm.increment('total_likes', {
            by: 1,
            where: {id: comment_id}
        })
    }

    decrementLikeCount(comment_id) {
        return this.orm.decrement('total_likes', {
            by: 1,
            where: {id: comment_id}
        })
    }
}

module.exports = PostComment;
