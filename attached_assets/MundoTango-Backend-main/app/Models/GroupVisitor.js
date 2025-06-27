const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const User = require("./User");
const sequelize = require("sequelize");
const {Sequelize} = require("sequelize");

class GroupVisitor extends RestModel {
    constructor() {
        super("group_visitors");
    }

    getFields = () => {
        return ['id', 'group_id', 'user_id', 'createdAt', 'updatedAt', 'deletedAt'];
    }

    showColumns = () => {
        return ['id', 'group_id', 'user_id', 'createdAt', 'updatedAt'];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    includeAssociations = () => {
        return [
            {
                model: User.instance().getModel(),
                as: 'user',
                attributes: ['id', 'image_url', 'username', 'email']
            }
        ]
    }

    async indexQueryHook(query, request, params) {
        query.where = {...request.query, group_id: request.params.group_id}
        query.include = [
            {
                model: User.instance().getModel(),
                as: 'user',
                attributes: ['id', 'image_url', 'username', 'email']
            }
        ]
        query.attributes = {
            include: [[sequelize.literal(`(
                         CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=group_id AND status='requested'
                            ) THEN 1
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=group_id AND status='invited'
                            ) THEN 2
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=group_id AND status='joined'
                            ) THEN 3
                            ELSE 0
                        END
                       
                    )`),
                'is_joined']]
        }
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
        params.createdAt = new Date()
        params.user_id = request.user.id
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }
}

module.exports = GroupVisitor;
