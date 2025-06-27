const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class DanceExperience extends RestModel {
    constructor() {
        super("dance_experience");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'social_dancing_cities', 'recent_workshop_cities',
            'favourite_dancing_cities', 'annual_event_count', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'social_dancing_cities', 'recent_workshop_cities',
            'favourite_dancing_cities', 'annual_event_count', 'createdAt'
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
            social_dancing_cities: params?.social_dancing_cities.join(","),
            recent_workshop_cities: params?.recent_workshop_cities.join(","),
            favourite_dancing_cities: params?.favourite_dancing_cities.join(","),
            annual_event_count: params?.annual_event_count,
            user_id: request?.user?.id
        })

        return _.isEmpty(record) ? {} : record.toJSON();
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

    async destroyRecord(request) {
        return this.orm.destroy({
            where: {
                id: request?.user.id
            }
        })
    }
}

module.exports = DanceExperience;
