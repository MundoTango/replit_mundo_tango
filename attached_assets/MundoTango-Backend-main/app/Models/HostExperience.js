
const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")
const Attachment = require("./Attachment");
const {HasMany, Op} = require("sequelize");

class HostExperience extends RestModel {
    constructor() {
        super("host_experience");
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

    async storeBulkRecord(request, params) {
        let idFind = await this.orm.findAll({
            where: {
                user_id: request?.user?.id
            },
            attributes: ['id']
        })

        let id_maps = []
        idFind.map(dt => {
            dt = dt.toJSON()
            id_maps.push(dt?.id)
        })

        await Attachment.instance().orm.destroy({
            where: {
                instance_type: "housing-host",
                instance_id: {
                    [Op.in]: id_maps
                }
            },
            force: true
        })

        await this.orm.destroy({
            where: {
                user_id: request?.user?.id
            },
            force: true
        })
        const record = await this.orm.bulkCreate(params)
        return _.isEmpty(record) ? {} : record;
    }

    async findRecordByUserId(user_id) {
        const record = await this.orm.findAll({
            where: {
                user_id: user_id
            },
            include: [{
                required: false,
                model: Attachment.instance().getModel(),
                association: new HasMany(this.getModel(), Attachment.instance().getModel(), {foreignKey: "instance_id"}),
                where: {
                    instance_type: "housing-host",
                }
            }]
        })

        console.log(record, "ce")

        return _.isEmpty(record) ? null : record;
    }

    async findRecordById(id) {
        const record = await this.orm.findAll({
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

module.exports = HostExperience;
