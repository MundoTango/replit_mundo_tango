const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");

class TangoActivities extends RestModel {
    constructor() {
        super("tango_activities");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'teacher_at', 'dj_at', 'photographer_at', 'host_at',
            'organizer_at', 'creator_at', 'performer_at', 'tour_operator_at',
            'other', 'social_dancer', 'deletedAt', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'teacher_at', 'dj_at', 'photographer_at', 'host_at',
            'organizer_at', 'creator_at', 'performer_at', 'tour_operator_at',
            'other', 'social_dancer', 'createdAt'
        ];
    }

    exceptUpdateField = () => {
        return ['id', 'user_id', 'createdAt'];
    }


    async getRecordByUserId(user_id) {
        const record = await this.orm.findOne({
            where: {
                user_id: user_id,
                deletedAt: null
            },
            orderBy: ["createdAt", "desc"],
        });

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async storeRecord (request) {
        let params = request.body
        const record = await this.orm.create({
            ...params,
            user_id: request?.user?.id
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async findRecordByUserId (user_id) {
        const record = await this.orm.findOne({
            where: {
                user_id: user_id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async findRecordById (id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async updateRecordByUserId (params, user_id) {
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
}

module.exports = TangoActivities;
