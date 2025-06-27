const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")
const User = require("./User");

class GroupMember extends RestModel {
    constructor() {
        super("group_members");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'group_type', 'name', 'image_url', 'location', 'city',
            'country', 'latitude', 'longitude', 'privacy', 'number_of_participants',
            'description', 'status', 'total_followers', 'createdAt', 'updatedAt', 'deletedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'group_type', 'name', 'image_url', 'location', 'city',
            'country', 'latitude', 'longitude', 'privacy', 'number_of_participants',
            'description', 'status', 'total_followers', 'createdAt', 'updatedAt', 'deletedAt'
        ];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    async createRecord(params) {
        const record = await this.orm.create(params)
        return _.isEmpty(record) ? {} : record;
    }

    async getRecordByCondition(where) {
        const record = await this.orm.findAll({
            where: where,
            include: [
                {
                    model: User.instance().getModel(),
                    attributes: ['image_url', 'id', 'username', 'email', 'city']
                }
            ]
        });

        return _.isEmpty(record) ? [] : record.map(dt => dt.toJSON());
    }

    async storeBulkRecord(params) {
        const record = await this.orm.bulkCreate(params)
        return _.isEmpty(record) ? {} : record;
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async destroyRecord(id) {
        const record = await this.orm.destroy({
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async updateRecord(id, params) {
        const record = await this.orm.update(params, {
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record;
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

module.exports = GroupMember;
