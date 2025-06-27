const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const User = require("./User");

class GroupActivity extends RestModel {
    constructor() {
        super("group_activities");
    }

    getFields = () => {
        return ['id', 'group_id', 'non_tango_activity_id', 'createdAt', 'updatedAt', 'deletedAt'];
    }

    showColumns = () => {
        return ['id', 'group_id', 'non_tango_activity_id', 'createdAt', 'updatedAt'];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    includeAssociations = () => {
        return [
            {
                model: User.instance().getModel()
            }
        ]
    }

    async indexQueryHook(query, request, params) {
        query.where = request.query
        query.include = this.includeAssociations()
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

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            },
            include: this.includeAssociations()
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
        console.log(params)
        params.createdAt = new Date()
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }
}

module.exports = GroupActivity;
