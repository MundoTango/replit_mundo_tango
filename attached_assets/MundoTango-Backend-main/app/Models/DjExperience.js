const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class DjExperience extends RestModel {
    constructor() {
        super("dj_experience");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'performed_events', 'cities', 'favourite_orchestra',
            'favourite_singer', 'milonga_size', 'use_external_equipments',
            'dj_softwares', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'performed_events', 'cities', 'favourite_orchestra',
            'favourite_singer', 'milonga_size', 'use_external_equipments', 'createdAt'
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
            performed_events: params?.performed_events,
            cities: params?.cities.join(','),
            favourite_orchestra: params?.favourite_orchestra,
            favourite_singer: params?.favourite_singer,
            milonga_size: params?.milonga_size,
            use_external_equipments: params?.use_external_equipments,
            dj_softwares: params?.dj_softwares,
            user_id: request?.user?.id
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async dateExistInTangoActivities(request) {
        let data = await TangoActivities.instance().findRecordByUserId(request?.user?.id)
        return data?.dj_at !== null;
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
            performed_events: params?.performed_events,
            cities: params?.cities.join(','),
            favourite_orchestra: params?.favourite_orchestra,
            favourite_singer: params?.favourite_singer,
            milonga_size: params?.milonga_size,
            use_external_equipments: params?.use_external_equipments,
            dj_softwares: params?.dj_softwares,
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

module.exports = DjExperience;
