const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")
const User = require("./User");
const Group = require("./Group");
const EventType = require("./EventType");
const EventParticipants = require("./EventParticipants");
const EventActivity = require("./EventActivity");
const {Op, Sequelize} = require("sequelize");
const UserQuestions = require("./UserQuestions");
const sequelize = require("sequelize");
const NonTangoActivity = require("./NonTangoActivity");

class Event extends RestModel {
    constructor() {
        super("events");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'event_type_id', 'city_group_id', 'name', 'image_url', 'start_date',
            'end_date', 'location', 'city', 'country', 'latitude', 'longitude', 'visibility',
            'description', 'about_space', 'status', 'createdAt', 'updatedAt', 'deletedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'event_type_id', 'city_group_id', 'name', 'image_url', 'start_date',
            'end_date', 'location', 'city', 'country', 'latitude', 'longitude', 'visibility',
            'description', 'about_space', 'status', 'createdAt', 'updatedAt', 'deletedAt'
        ];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    includeAssociations() {
        return [
            {
                required: false,
                model: User.instance().getModel(),
                as: 'user',
                attributes: ['name', 'username', 'email', 'id']
            },
            {
                required: false,
                model: EventType.instance().getModel()
            },
            {
                required: false,
                model: EventParticipants.instance().getModel(),
                include: [
                    {
                        model: User.instance().getModel(),
                        attributes: ['name', 'username', 'email', 'id', 'image_url']
                    }
                ]
            },
            {
                required: false,
                model: EventActivity.instance().getModel()
            },
            {
                model: EventActivity.instance().getModel(),
                include: [
                    {
                        model: NonTangoActivity.instance().getModel()
                    }
                ]
            }
        ]
    }

    async createRecord(params) {
        const record = await this.orm.create(params)
        return _.isEmpty(record) ? {} : record;
    }

    async getRecordByCondition(request, where) {
        let {query_type} = request.query
        if (!query_type) query_type = 0
        let conditional_attributes = query_type == 1 ? ['id', 'latitude', 'name', 'longitude', 'location'] : this.showColumns()
        delete where['query_type']

        if (request.query.city) {
            where['city'] = {
                [Op.like]: `%${request.query.city}%`
            }
        } else {
            delete where['city']
        }
        const record = await this.orm.findAll({
            where: where,
            include: query_type == 1 ? [] : this.includeAssociations(),
            order: [['createdAt', 'desc']],
            attributes: [
                ...conditional_attributes,
                [sequelize.literal(`(
                         CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM event_participants 
                                WHERE 
                                    user_id=${request.user.id} AND event_id=events.id AND status='invited'
                            ) THEN 1
                            WHEN EXISTS (
                                SELECT 1 
                                FROM event_participants 
                                WHERE 
                                    user_id=${request.user.id} AND event_id=events.id AND status='interested'
                            ) THEN 2
                            WHEN EXISTS (
                                SELECT 1 
                                FROM event_participants 
                                WHERE 
                                    user_id=${request.user.id} AND event_id=events.id AND status='going'
                            ) THEN 3
                            ELSE 0
                        END
                       
                    )`),
                    'going_status'],

            ]
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
        params.text = params.text?.trim()
        params.createdAt = new Date()
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }

    async upcoming_event_timeline(request) {
        let upcoming_event = await this.orm.findAll(({
            where: {
                start_date: {
                    [Op.gt]: new Date()
                }
            },
            limit: 4
        }))

        let event_in_your_city = await this.orm.findAll(({
            where: {
                start_date: {
                    [Op.gt]: new Date()
                },
                city: request.user.city
            },
            limit: 4
        }))
        let followed_event = await this.orm.findAll({
            where: {
                start_date: {
                    [Op.gt]: new Date()
                }
            },
            limit: 4,
            include: [
                {
                    required: true,
                    model: EventParticipants.instance().getModel(),
                    where: {
                        user_id: request.user.id,
                        status: 'interested'
                    }
                }
            ]
        })

        return {followed_event, event_in_your_city, upcoming_event}
    }


    async getChartData(request) {
        let {event_id} = request.params
        let user_ids = await EventParticipants.instance().orm.findAll({
            where: {
                event_id: event_id,
            },
            attributes: ["user_id"]
        })

        user_ids = user_ids.map(dt => dt.toJSON())
        user_ids = user_ids.map(dt => dt.user_id)

        const chart = await UserQuestions.instance().orm.findAll({
            where: {user_id: {[Op.in]: user_ids}},
            attributes: ['languages', 'city', 'dance_role_leader', 'start_dancing'], // Fetch raw data
        });

        const country = await User.instance().orm.findAll({
            where: {
                id: {[Op.in]: user_ids}
            },
            attributes: ['country']
        })

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

        const countryTotals = {};
        country.forEach(record => {
            const country = record?.country;
            if(country && country!="") {
                countryTotals[country] = (countryTotals[country] || 0) + 1;
            }
        });

        const danceRoleTotals = {};
        chart.forEach(record => {
            const dance_role = record.dance_role_leader;
            danceRoleTotals[dance_role] = (danceRoleTotals[dance_role] || 0) + 1
        });

        const yearTangoTotals = {
            "0-5": 0,
            "5-10": 0,
            "10-15": 0,
            "15-20": 0,
            "20+": 0
        };
        chart.forEach(record => {
            const year_tango = new Date(record.start_dancing).getFullYear();
            const current_year = new Date().getFullYear()
            let diff_year = parseInt(current_year) - parseInt(year_tango)

            if(diff_year < 5) yearTangoTotals['0-5']++
            if(diff_year > 5 && diff_year < 10) yearTangoTotals['5-10']++
            if(diff_year > 10 && diff_year < 15) yearTangoTotals['10-15']++
            if(diff_year > 15 && diff_year < 20) yearTangoTotals['15-20']++
            if(diff_year > 20) yearTangoTotals['20+']++
        });
        return {languageTotals, cityTotals, danceRoleTotals, yearTangoTotals, countryTotals}
    }

    async getAllEventsForAdmin(request) {
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
            order: [['createdAt', 'DESC']],
            attributes: {
                include: [
                    [Sequelize.literal(`(SELECT COUNT(*) FROM event_participants WHERE event_id=events.id AND deletedAt IS NULL AND status='interested')`), 'total_interested_users'],
                    [Sequelize.literal(`(SELECT COUNT(*) FROM event_participants WHERE event_id=events.id AND deletedAt IS NULL AND status='invited')`), 'total_invited_users'],
                    [Sequelize.literal(`(SELECT COUNT(*) FROM event_participants WHERE event_id=events.id AND deletedAt IS NULL AND status='going')`), 'total_going_users'],
                ]
            }
        })
    }

    getEventDetailAdmin(request) {
        return this.orm.findOne({
            where: {
                id: request.params.id
            },
            include: this.includeAssociations(),
            attributes: {
                include: [
                    [Sequelize.literal(`(SELECT COUNT(*) FROM event_participants WHERE event_id=events.id AND deletedAt IS NULL AND status='interested')`), 'total_interested_users'],
                    [Sequelize.literal(`(SELECT COUNT(*) FROM event_participants WHERE event_id=events.id AND deletedAt IS NULL AND status='invited')`), 'total_invited_users'],
                    [Sequelize.literal(`(SELECT COUNT(*) FROM event_participants WHERE event_id=events.id AND deletedAt IS NULL AND status='going')`), 'total_going_users'],
                ]
            }
        })
    }

    async getEventWeMeet(request) {
        return  EventParticipants.instance().orm.findAll({
            where: {
                user_id: request.params.friend_id,
                [Op.and]: Sequelize.literal(`EXISTS (SELECT 1 FROM event_participants AS ep WHERE ep.event_id = event_participants.event_id AND ep.user_id = ${request.user.id})`)
            },
            include: [
                {
                    model: Event.instance().getModel(),
                    attributes: Event.instance().showColumns()
                }
            ]
        })
    }
}

module.exports = Event;
