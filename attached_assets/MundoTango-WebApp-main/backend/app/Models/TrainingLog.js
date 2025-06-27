const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');
const moment = require('moment')

const RestModel = require("./RestModel");
const { Op } = require("../Database");
// const trainingTimer = require("../Helper/TrainingTimer");

class TrainingLog extends RestModel {

    constructor() {
        super("training_logs")
        // this.timer = trainingTimer
    }

    getFields() {
        return [
            'datetime'
        ];
    }



    showColumns() {
        return [
            'slug', 'user_slug', 'startedAt', 'endedAt'
        ];
    }

    softdelete() {
        return true;
    }

    async createRecord(request, params) {
        const user_slug = request.user.slug;
        const record = await this.getUserStartedLog(user_slug);
        let response;

        if (_.isEmpty(record)) {
            const payload = {};
            payload.slug = uuidv4();
            payload.user_slug = user_slug;
            payload.startedAt = moment(params.datetime).format()
            payload.createdAt = new Date();

            response = await this.orm.create(payload)

            // this.timer.setTimer(user_slug, this.checkOutTimer)
            return response.toJSON()
        }
        else {
            const payload = {}
            payload.endedAt = moment(params.datetime).format()

            await this.orm.update(payload, {
                where: {
                    slug: record.slug
                }
            })

            response = await this.getRecordByCondition(request, { slug: record.slug })
            // if (this.timer.hasTimer(user_slug)) {
            //     clearTimeout(this.timer.getTimer(user_slug))
            //     this.timer.deleteTimer(user_slug)
            // }
            return response;

        }
    }

    async getTotalLogDays(user_slug = '') {
        const record = await this.orm.findAll({
            where: {
                user_slug: user_slug,
                endedAt: { [Op.ne]: null },
                deletedAt: null
            },
            raw: true,
        })
        return _.isEmpty(record) ? [] : record
    }

    async getWeeklyRecord(request, params) {
        const user_slug = request.user.slug;
        const start_date = new Date(moment(params.datetime).startOf('day'));
        const end_date = new Date(moment(start_date).add(6, 'days').endOf('day'));

        const record = await this.orm.findAll({
            where: {
                user_slug: user_slug,
                startedAt: { [Op.gte]: start_date },
                endedAt: { [Op.lte]: end_date },
                deletedAt: null
            }
        })
        return record;
    }

    async getMonthlyRecord(request, params) {
        const user_slug = request.user.slug;
        const start_date = new Date(moment(params.datetime).startOf('month'));
        const end_date = new Date(moment(start_date).endOf('month'));

        const record = await this.orm.findAll({
            where: {
                user_slug: user_slug,
                startedAt: { [Op.gte]: start_date },
                endedAt: { [Op.lte]: end_date },
                deletedAt: null
            }
        })
        return record;
    }

    async getYearlyRecord(request, params) {
        const user_slug = request.user.slug;
        const start_date = new Date(moment(params.datetime).startOf('year'));
        const end_date = new Date(moment(start_date).endOf('year'));

        const record = await this.orm.findAll({
            where: {
                user_slug: user_slug,
                startedAt: { [Op.gte]: start_date },
                endedAt: { [Op.lte]: end_date },
                deletedAt: null
            }
        })
        return record;
    }

    async getUserStartedLog(user_slug) {
        const record = await this.orm.findOne({
            where: {
                user_slug: user_slug,
                endedAt: null,
                deletedAt: null
            }
        })

        return _.isEmpty(record) ? {} : record.toJSON()
    }



}

module.exports = TrainingLog