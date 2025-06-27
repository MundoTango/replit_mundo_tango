const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const Attachment = require("./Attachment");
const sequelize = require("sequelize");
const {Sequelize, HasMany} = require("sequelize");
const User = require("../Models/User")
const UserImages = require("../Models/UserImages")
const Post = require("../Models/Post")
const PostComment = require("./PostComment");

class PostCommentLike extends RestModel {
    constructor() {
        super("post_comment_likes");
    }

    getFields = () => {
        return ['id', 'user_id', 'post_id']
    }

    showColumns = () => {
        return ['id', 'user_id', 'post_id']
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    includeAssociations = () => {
        return [
            {
                model: Post.instance().getModel(),
                include: [
                    {
                        model: Attachment.instance().getModel(),
                        association: new HasMany(this.getModel(), Attachment.instance().getModel(), {foreignKey: "instance_id"}),
                        where: {
                            instance_type: 'post'
                        }
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

        let record = await this.orm.findOne({
            where: {
                comment_id: params?.comment_id,
                user_id: request?.user?.id
            }
        })

        if (!record) {
            record = await this.orm.create({
                comment_id: params?.comment_id,
                user_id: request?.user?.id
            })
            await PostComment.instance().incrementLikeCount(params?.comment_id)
        }

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async destroyRecord(id) {
        await this.orm.destroy({
            where: {
                id: id
            },
            force: true
        })
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            },
            // include: this.includeAssociations()
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
            // include: this.includeAssociations()
        });

        return _.isEmpty(record) ? null : record.toJSON();
    }
}

module.exports = PostCommentLike;
