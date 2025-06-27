const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const GroupMember = require("./GroupMember");
const User = require("./User");
const UserQuestions = require("./UserQuestions");
const sequelize = require("sequelize");
const {Op, Sequelize} = require("sequelize");

class Group extends RestModel {
    constructor() {
        super("groups");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'group_type', 'name', 'image_url', 'location', 'city',
            'country', 'latitude', 'longitude', 'privacy', 'number_of_participants', 'address',
            'description', 'status', 'total_followers', 'createdAt', 'updatedAt', 'deletedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'group_type', 'name', 'image_url', 'location', 'city',
            'country', 'latitude', 'longitude', 'privacy', 'number_of_participants', 'address',
            'description', 'status', 'total_followers', 'createdAt', 'updatedAt', 'deletedAt'
        ];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    includeAssociations = () => {
        return [
            {
                required: false,
                model: User.instance().getModel(),
                attributes: ['id', 'name', 'email', 'image_url']
            },
            {
                required: false,
                model: GroupMember.instance().getModel(),
                where: {
                    status: "joined"
                },
                attributes: ['group_id', 'user_type', 'status'],
                include: [
                    {
                        required: false,
                        model: User.instance().getModel(),
                        attributes: ['id', 'name', 'email', 'image_url']
                    }
                ]
            }
        ]
    }

    async indexQueryHook(query, request, params) {
        let search = {...request.query}

        query.attributes = [
            ...this.getFields(),
            [sequelize.literal(`(
                         CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=groups.id AND status='requested'
                            ) THEN 1
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=groups.id AND status='invited'
                            ) THEN 2
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=groups.id AND status='joined'
                            ) THEN 3
                            ELSE 0
                        END
                       
                    )`),
                'is_joined'],
            [sequelize.literal(`(SELECT COUNT(*) FROM pin_groups WHERE user_id=${request.user.id} AND group_id=groups.id)`), 'is_pinned']
        ]

        query.include = [
            {
                required: false,
                model: User.instance().getModel(),
                attributes: ['id', 'name', 'email', 'image_url']
            },
            {
                required: false,
                model: GroupMember.instance().getModel(),
                where: {
                    status: "joined"
                },
                attributes: ['group_id', 'user_type', 'status'],
                include: [
                    {
                        model: User.instance().getModel(),
                        attributes: ['id', 'name', 'email', 'image_url']
                    }
                ]
            }
        ]
        query.order = [['createdAt', 'DESC']]

        delete search['page']
        delete search['per_page']
        delete search['limit']

        query.where = search

    }

    async createRecord(params) {
        const record = await this.orm.create(params)
        return _.isEmpty(record) ? {} : record;
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

    async findRecordById(request) {
        const record = await this.orm.findOne({
            where: {
                id: request.params.id
            },
            attributes: {
                include: [[sequelize.literal(`(
                         CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=groups.id AND status='requested'
                            ) THEN 1
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=groups.id AND status='invited'
                            ) THEN 2
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=${request.user.id} AND group_id=groups.id AND status='joined'
                            ) THEN 3
                            ELSE 0
                        END
                       
                    )`),
                    'is_joined']]
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
        params.text = params.text?.trim()
        params.createdAt = new Date()
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }

    async getChartData(request) {
        let {group_id} = request.params
        let user_ids = await GroupMember.instance().orm.findAll({
            where: {
                group_id: group_id,
                status: 'joined'
            },
            attributes: ["id"]
        })

        user_ids = user_ids.map(dt => dt.toJSON())
        user_ids = user_ids.map(dt => dt.id)

        const chart = await UserQuestions.instance().orm.findAll({
            where: {user_id: {[Op.in]: user_ids}},
            attributes: ['languages', 'city', 'dance_role_leader', 'start_dancing'], // Fetch raw data
        });

        const languageTotals = {};
        chart.forEach(record => {
            const languages = record.languages.split(',');
            languages.forEach(language => {
                language = language.trim(); // Remove extra spaces
                languageTotals[language] = (languageTotals[language] || 0) + 1;
            });
        });

        const cityTotals = {};
        chart.forEach(record => {
            const city = record.city.split(',');
            city.forEach(dt => {
                dt = dt.trim(); // Remove extra spaces
                cityTotals[dt] = (cityTotals[dt] || 0) + 1;
            });
        });

        const danceRoleTotals = {};
        chart.forEach(record => {
            const dance_role = record.dance_role_leader;
            danceRoleTotals[dance_role] = (danceRoleTotals[dance_role] || 0) + 1
        });

        const yearTangoTotals = {};
        chart.forEach(record => {
            const year_tango = new Date(record.start_dancing).getFullYear();
            yearTangoTotals[year_tango] = (yearTangoTotals[year_tango] || 0) + 1
        });
        return {languageTotals, cityTotals, danceRoleTotals, yearTangoTotals}
    }

    async getAllGroupsForAdmin(request) {
        let page = parseInt(request.query.page) || 1
        let limit = parseInt(request.query.limit) || 10
        let offset = (page - 1) * limit

        return this.orm.findAndCountAll({
            where: {
                deletedAt: null,
                ...(request.query.search && {
                    name: {
                        [Op.like]: `%${request.query.search}%`
                    }
                }),
            },
            include: this.includeAssociations(),
            offset: offset,
            limit,
            attributes: {
                exclude: ['total_followers'],
                include: [
                    [Sequelize.literal(`(SELECT COUNT(*) FROM group_members WHERE group_id=groups.id AND deletedAt IS NULL AND status='joined')`), 'total_followers']
                ]
            }
        })
    }

    getGroupDetailAdmin(request) {
        return this.orm.findOne({
            where: {
                id: request.params.id
            },
            include: this.includeAssociations(),
            attributes: {
                exclude: ['total_followers'],
                include: [
                    [Sequelize.literal(`(SELECT COUNT(*) FROM group_members WHERE group_id=groups.id AND deletedAt IS NULL AND status='joined')`), 'total_followers']
                ]
            }
        })
    }
}

module.exports = Group;
