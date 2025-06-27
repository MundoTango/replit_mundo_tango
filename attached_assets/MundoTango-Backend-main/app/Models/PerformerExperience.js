const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class PerformerExperience extends RestModel {
    constructor() {
        super("performer_experience");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'partner_profile_link', 'recent_performance_url',
            'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'partner_profile_link', 'recent_performance_url',
            'createdAt'
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
            partner_profile_link: params?.partner_profile_link.join(','),
            recent_performance_url: params?.recent_performance_url,
            user_id: request?.user?.id
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async dateExistInTangoActivities(request) {
        let data = await TangoActivities.instance().findRecordByUserId(request?.user?.id)
        return data?.performer_at !== null;
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
            partner_profile_link: params?.partner_profile_link.join(','),
            recent_performance_url: params?.recent_performance_url,
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

module.exports = PerformerExperience;
