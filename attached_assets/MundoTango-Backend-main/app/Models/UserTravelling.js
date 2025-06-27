
const _ = require("lodash")
const {v4: uuidv4} = require('uuid');

const RestModel = require("./RestModel")
const Subscription = require("./Subscription");
const EventType = require("./EventType");

class UserTravelling extends RestModel {

    constructor() {
        super("user_travels")
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
        return ['id', 'user_id', 'event_type_id', 'event_name', 'city', 'start_date', 'end_date', 'status', 'createdAt', 'updatedAt', 'deletedAt'];
    }


    showColumns() {
        return ['id', 'user_id', 'event_type_id', 'event_name', 'city', 'start_date', 'end_date', 'status', 'createdAt', 'updatedAt', 'deletedAt'];
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
        // query.user_id = request?.user?.id
        query.where = {
            user_id: request?.user?.id
        }
    }

    /**
     * Hook for manipulate data input before add data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async beforeCreateHook(request, params) {
        // await this.deleteRecord(params?.platform_id)
        params.user_id = request?.user?.id
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
            order: [['createdAt', 'DESC']]
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async findAllRecordByCondition(query) {
        const record = await this.orm.findAll({
            where: query,
            include: [
                {
                    required: false,
                    model: EventType.instance().getModel()
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        return _.isEmpty(record) ? [] : record.map(dt => dt.toJSON());
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


    async deleteRecord(request, params, id) {
        console.log("Delete User Record By Platform ID ", id)
        const query = await this.orm.destroy({
            where: {
                id: request.params.id
            },
            force: true
        })
        return true;
    }


}

module.exports = UserTravelling;