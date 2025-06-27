
const _ = require("lodash")
const {v4: uuidv4} = require('uuid');

const RestModel = require("./RestModel")
const ReportType = require("./ReportType")
const Post = require("./Post")
const User = require("./User")
const Attachment = require("./Attachment")
const Group = require("./Group")
const Subscription = require("./Subscription");
const {BelongsTo, HasMany} = require("sequelize");

class Report extends RestModel {

    constructor() {
        super("reports")
    }

    softdelete() {
        return true;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return ['id', 'user_id', 'report_type_id', 'instance_type', 'instance_id', 'description', 'status', 'createdAt', 'updatedAt', 'deletedAt'];
    }


    showColumns() {
        return ['id', 'user_id', 'report_type_id', 'instance_type', 'instance_id', 'description', 'status', 'createdAt', 'updatedAt', 'deletedAt'];
    }

    /**
     * omit fields from update request
     */
    exceptUpdateField() {
        return [];
    }

    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} slug
     */
    async indexQueryHook(query, request, slug = {}) {
        query.include = [
            {
                model: ReportType.instance().getModel(),
                association: new BelongsTo(this.getModel(), ReportType.instance().getModel(), {foreignKey: "report_type_id"}),
            },
            {
                model: Post.instance().getModel(),
                association: new BelongsTo(this.getModel(), Post.instance().getModel(), {foreignKey: "instance_id"}),
                include: [
                    {
                        required: false,
                        model: Attachment.instance().getModel(),
                        association: new HasMany(this.getModel(), Attachment.instance().getModel(), { foreignKey: "instance_id" }),
                        where: {
                            instance_type: 'post'
                        },
                        attributes: ['media_url', 'thumbnail_url', 'instance_type', 'id', 'media_type']
                    },
                    {
                        model: User.instance().getModel(),
                        attributes: ['id', 'firstname', 'lastname', 'email', 'image_url', 'username', 'slug']
                    }
                ]
            },
            {
                model: User.instance().getModel(),
                association: new BelongsTo(this.getModel(), User.instance().getModel(), {foreignKey: "instance_id"}),
                attributes: ['id', 'firstname', 'lastname', 'email', 'image_url', 'username', 'slug']
            },
            {
                model: Group.instance().getModel(),
                association: new BelongsTo(this.getModel(), Group.instance().getModel(), {foreignKey: "instance_id"}),
            },
            {
                model: User.instance().getModel(),
                as: 'reporter_user',
                attributes: ['id', 'firstname', 'lastname', 'email', 'image_url', 'username', 'slug']
            }
        ];

    }

    /**
     * Hook for manipulate data input before add data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async beforeCreateHook(request, params) {
        // await this.deleteRecord(params?.platform_id)
        params.user_id = request?.user?.id
        params.createdAt = new Date();
    }

    /**
     * Hook for execute command after add public static function called
     * @param {saved record object} record
     * @param {controller request object} request
     * @param {payload object} params
     */
    async afterCreateHook(record, request, params) {
    }


    /**
     * Hook for manipulate data input before update data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     * @param {string} slug
     */
    async beforeEditHook(request, params, slug) {
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            },
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async findRecordByCondition(query) {
        const record = await this.orm.findOne({
            where: query,
            include: [
                {
                    model: Subscription.instance().getModel()
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }


    async findOrCreateRecord(request, params) {
        let user;
        user = (await this.orm.findOne({
            where: {
                email: params.email,
                platform_id: params.platform_id,
                platform_type: params.platform_type,
                deletedAt: null
            }
        }))?.toJSON()

        if (_.isEmpty(user)) {
            user = await this.createRecord(request, params)
        }

        return user;
    }

    async createRecord(request, params) {
        let data = await this.orm.create({...params, user_id: request?.user?.id})
        return data;
    }


    async getUserRecord(platform_id, platform_type) {
        const record = await this.orm.findOne({
            where: {
                platform_id,
                platform_type,
                deletedAt: null
            },
            order: [['createdAt', 'desc']],
        })

        return _.isEmpty(record) ? {} : record.toJSON()

    }


    async deleteRecord(id) {
        console.log("Delete User Record By Platform ID ", id)
        const query = await this.orm.destroy({
            where: {
                id: id
            }
        })
        return true;

    }


}

module.exports = Report;