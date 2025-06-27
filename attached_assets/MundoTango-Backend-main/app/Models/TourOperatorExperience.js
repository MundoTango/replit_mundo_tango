const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class TourOperatorExperience extends RestModel {
    constructor() {
        super("tour_operator_experience");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'cities', 'website_url', 'theme',
            'vendor_activities', 'vendor_url', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'cities', 'website_url', 'theme',
            'vendor_activities', 'vendor_url', 'createdAt'
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

    async storeRecord(request) {
        let params = request.body
        const record = await this.orm.create({
            cities: params?.cities.join(","),
            website_url: params?.website_url,
            vendor_activities: params?.vendor_activities,
            vendor_url: params?.vendor_url,
            theme: params?.theme,
            user_id: request?.user?.id
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async dateExistInTangoActivities(request) {
        let data = await TangoActivities.instance().findRecordByUserId(request?.user?.id)
        return data?.tour_operator_at !== null;
    }

    async findRecordByUserId(user_id) {
        const record = await this.orm.findOne({
            where: {
                user_id: user_id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
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
            cities: params?.cities.join(","),
            website_url: params?.website_url,
            vendor_activities: params?.vendor_activities,
            vendor_url: params?.vendor_url,
            theme: params?.theme,
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

module.exports = TourOperatorExperience;
