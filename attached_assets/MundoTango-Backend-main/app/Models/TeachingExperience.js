const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class TeachingExperience extends RestModel {
    constructor() {
        super("teaching_experience");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'partner_facebook_url', 'cities', 'online_platforms','preferred_size','teaching_reason',
            'about_tango_future', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'partner_facebook_url', 'cities', 'online_platforms','preferred_size','teaching_reason',
            'about_tango_future', 'createdAt', 'updatedAt'
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
        console.log(params, "preferred_size")
        const record = await this.orm.create({
            cities: params?.cities.join(',') ,
            online_platforms: params?.online_platforms?.join(','),
            about_tango_future: params?.about_tango_future,
            partner_facebook_url: params?.partner_facebook_url,
            preferred_size: params?.preferred_size,
            teaching_reason: params?.teaching_reason,
            user_id: request?.user?.id
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async dateExistInTangoActivities(request) {
        let data = await TangoActivities.instance().findRecordByUserId(request?.user?.id)
        return data?.teacher_at !== null;
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
        console.log(params, "preferred_size")

        await this.orm.update({
            ...(params.cities && {cities: params?.cities.join(',')}),
            ...(params.online_platforms && {online_platforms: params?.online_platforms?.join(',')}),
            ...(params.about_tango_future && {about_tango_future: params?.about_tango_future}),
            ...(params.partner_facebook_url && {partner_facebook_url: params?.partner_facebook_url}),
            ...(params.preferred_size && {preferred_size: params?.preferred_size}),
            ...(params.teaching_reason && {teaching_reason: params?.teaching_reason}),
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

module.exports = TeachingExperience;
