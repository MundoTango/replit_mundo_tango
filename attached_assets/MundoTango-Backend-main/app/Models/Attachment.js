const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class Attachment extends RestModel {
    constructor() {
        super("attachments");
    }

    getFields = () => {
        return [
            'id', 'instance_type', 'instance_id', 'media_type',
            'media_url', 'thumbnail_url',
        ];
    }

    showColumns = () => {
        return [
            'id', 'instance_type', 'instance_id', 'media_type',
            'media_url', 'thumbnail_url',
        ];
    }

    exceptUpdateField = () => {
        return ['id'];
    }


    async getRecordByUserId(user_id) {
        const record = await this.orm.findOne({
            where: {
                user_id: user_id,
                deletedAt: null
            },
            orderBy: ["desc"],
        });

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async getRecordByCondition(where) {
        const record = await this.orm.findAll({
            where: where,
        });

        return _.isEmpty(record) ? [] : record.map(dt => dt.toJSON());
    }

    async storeBulkRecord(params) {
        const record = await this.orm.bulkCreate(params, {raw: true})
        return _.isEmpty(record) ? {} : record;
    }

    async findRecordByUserId(user_id) {
        const record = await this.orm.findAll({
            where: {
                user_id: user_id
            }
        })

        return _.isEmpty(record) ? null : record;
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async updateRecordByUserId(params, user_id) {
        await this.orm.update({
            social_dancing_cities: params?.social_dancing_cities.join(","),
            recent_workshop_cities: params?.recent_workshop_cities.join(","),
            favourite_dancing_cities: params?.favourite_dancing_cities.join(","),
            annual_event_count: params?.annual_event_count
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

module.exports = Attachment;
