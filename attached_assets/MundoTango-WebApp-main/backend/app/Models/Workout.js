const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');

const RestModel = require("./RestModel");
const { joinText } = require("../Helper");
const Exercise = require("./Exercises");
const { POST_TYPE_ENUM } = require("../config/enum");
const constants = require("../config/constants");
const { Op } = require("../Database");
const StripePayment = require("./StripePayment");

class Workout extends RestModel {

    constructor() {
        super("posts")
    }

    softdelete() {
        return true;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return [
            'title', 'description', 'tags', 'is_paid', 'price'
        ];
    }


    showColumns() {
        return [
            'slug', 'user_slug', 'type', 'image_url', 'title', 'description', 'tags', 'is_paid', 'price'
        ];
    }

    /**
     * omit fields from update request
     */
    exceptUpdateField() {
        return [
            'id', 'slug', 'user_slug', 'type'
        ];
    }

    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} slug
     */
    async indexQueryHook(query, request, slug = {}) {
        const params = request.params;
        query.where = {
            ...query.where,
            user_slug: params.id,
            type: POST_TYPE_ENUM.WORKOUT
        }
    }


    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} slug
     */
    async singleQueryHook(query, request, slug = {}) {
        query.where = {
            ...query.where,
            type: POST_TYPE_ENUM.WORKOUT
        }
        query.include = [
            {
                model: Exercise.instance().getModel(),
                required: false,
                as: 'Exercise_WorkoutSlug',
                where: {
                    is_activated: true,
                    deletedAt: null
                }
            },
            {
                model: StripePayment.instance().getModel(),
                required: false,
                where: {
                    created_by: request.user.slug
                }
            }
        ]
    }


    /**
     * Hook for manipulate data input before add data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
        params.user_slug = request.user.slug;
        params.type = POST_TYPE_ENUM.WORKOUT;
        params.is_shared = false;
        params.image_url = request.image_url;
        params.tags = joinText(params.tags);
        params.is_paid = (params.is_paid == '1') ? true : false;
        params.price = (params.is_paid == '1') ? (parseFloat(params.price) || 1) : null;
        params.is_activated = true
        params.createdAt = new Date();
    }

    async afterCreateHook(record, request, params) {
        let exercises = request.body?.exercise || [];
        if (_.isEmpty(exercises) || !Array.isArray(exercises)) return;

        request.body.workout_slug = record.toJSON().slug;
        exercises = await Exercise.instance().createRecord(request, exercises)
        request.exercise = exercises
    }


    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });

        if (request.image_url) {
            params.image_url = request.image_url;
        }
        params.tags = joinText(params.tags);
        params.is_paid = (params.is_paid == '1') ? true : false;
        params.price = (params.is_paid == '1') ? (parseFloat(params.price) || 1) : null;
    }


    async afterEditHook(record, request, params) {
        let exercises = request.body?.exercise || [];
        let deleted_exercise = request.body?.deleted_exercise || [];
        if (!_.isEmpty(exercises) && Array.isArray(exercises)) {
            exercises = await Exercise.instance().updateRecord(request, exercises)
            request.exercise = exercises
        };
        if (!_.isEmpty(deleted_exercise) && Array.isArray(deleted_exercise)) {
            await Exercise.instance().deleteRecord(request, {}, deleted_exercise)
        }
    }

    async getHomeWorkouts(request) {
        const is_paid = request.query?.is_paid || false
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        const { count, rows } = await this.orm.findAndCountAll({
            where: {
                type: POST_TYPE_ENUM.WORKOUT,
                is_paid: is_paid,
                is_activated: true,
                deletedAt: null
            },
            limit: limit,
            offset: page * limit

        })

        request.query.total = count;
        return rows.map(item => item.toJSON())
    }

    async getSearchWorkouts(request) {
        const search = request.query?.search || ''
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        const { count, rows } = await this.orm.findAndCountAll({
            where: {
                type: POST_TYPE_ENUM.WORKOUT,
                title: { [Op.like]: `%${search}%` },
                is_shared: false,
                is_activated: true,
                deletedAt: null
            },
            limit: limit,
            offset: page * limit

        })

        request.query.total = count;
        return rows.map(item => item.toJSON())
    }

}

module.exports = Workout;