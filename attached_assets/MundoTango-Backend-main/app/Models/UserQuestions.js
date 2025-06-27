const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");

class UserQuestions extends RestModel {
    constructor() {
        super("user_questions");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'city', 'start_dancing', 'guide_visitors',
            'is_nomad', 'lived_for_tango', 'languages', 'website_url',
            'dance_role_leader', 'dance_role_follower', 'about', 'deletedAt',
            'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'city', 'start_dancing', 'guide_visitors',
            'is_nomad', 'lived_for_tango', 'languages', 'website_url',
            'dance_role_leader', 'dance_role_follower', 'about', 'createdAt'
        ];
    }

    exceptUpdateField() {
        return ['id', 'user_id', 'createdAt',];
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
            city: params?.city.join(',') || null,
            start_dancing: params?.start_dancing || null,
            is_nomad: params?.is_nomad || false,
            guide_visitors: params?.guide_visitors || false,
            lived_for_tango: params?.lived_for_tango.join(",") || "",
            languages: params?.languages.join(",") || "",
            website_url: params?.website_url || "",
            dance_role_leader: params?.dance_role_leader || "",
            dance_role_follower: params?.dance_role_follower || "",
            about: params?.about || "",
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
        console.log("Update Record Params : ", params);

        await this.orm.update({
            ...(params.city && {city: params?.city.join(",")}),
            ...(params.start_dancing && {start_dancing: params?.start_dancing}),
            ...(params.is_nomad && {is_nomad: params?.is_nomad}),
            ...(params.guide_visitors && {guide_visitors: params?.guide_visitors}),
            ...(params.lived_for_tango && {lived_for_tango: Array.isArray(params?.lived_for_tango) ? params?.lived_for_tango.join(",") : params?.lived_for_tango}),
            ...(params.languages && {languages:  Array.isArray(params?.languages) ? params?.languages?.join(",") : params?.languages}),
            ...(params.website_url && {website_url: params?.website_url}),
            ...(params.dance_role_leader && {dance_role_leader: params?.dance_role_leader}),
            ...(params.dance_role_follower && {dance_role_follower: params?.dance_role_follower}),
            ...(params.about && {about: params?.about}),
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

module.exports = UserQuestions;
