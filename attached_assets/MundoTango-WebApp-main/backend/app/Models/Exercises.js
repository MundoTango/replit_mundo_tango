const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');

const RestModel = require("./RestModel");

class Exercise extends RestModel {

    constructor() {
        super("exercises")
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
            'workout_slug', 'title', 'details'
        ];
    }


    showColumns() {
        return [
            'slug', 'workout_slug', 'title', 'details'
        ];
    }

    /**
     * omit fields from update request
     */
    exceptUpdateField() {
        return [
            'slug', 'workout_slug'
        ];
    }

    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} slug
     */
    async indexQueryHook(query, request, slug = {}) {

    }


    async createRecord(request, params) {
        //before create hook
        console.log("Before creating record hook : ", params)


        if (Array.isArray(params)) {

            let response = [];
            const workout_slug = request.body.workout_slug;
            for (let i = 0; i < params.length; i++) {
                const data = params[i];
                const payload = {}
                payload.slug = uuidv4()
                payload.workout_slug = workout_slug;
                payload.title = data.title;
                payload.details = data.details;
                payload.createdAt = new Date();
                response.push(payload)
            }
            var record = await this.orm.bulkCreate(response)
            return record.map(item => item.toJSON())
        }
        else {
            params.slug = uuidv4()
            params.createdAt = new Date();
            //insert record
            var record = await this.orm.create(params);
            console.log("Orm created Record : ", record.toJSON());
            return record.toJSON();
        }
    }

    async updateRecord(request, params, slug = '') {
        if (Array.isArray(params)) {
            try {
                let response = [];
                const workout_slug = request.params.id
                for (let i = 0; i < params.length; i++) {
                    const data = params[i];
                    const payload = {}
                    let record;

                    if (data.slug) {
                        payload.workout_slug = workout_slug;
                        payload.title = data.title;
                        payload.details = data.details;
                        record = await this.orm.update(payload, {
                            where: {
                                slug: data.slug
                            }
                        })
                        response.push(data)
                    }
                    else {
                        payload.slug = uuidv4()
                        payload.workout_slug = workout_slug;
                        payload.title = data.title;
                        payload.details = data.details;
                        payload.createdAt = new Date();
                        record = await this.orm.create(payload)
                        response.push(record.toJSON())
                    }
                }

                return response;

            }
            catch (err) {
                console.log(err)
            }
        }
        else {
            let exceptUpdateField = this.exceptUpdateField();
            exceptUpdateField.filter(exceptField => {
                delete params[exceptField];
            });

            if (!_.isEmpty(params)) {
                console.log(params)
                record = await this.orm.update(params, {
                    where: {
                        slug: slug
                    }
                })
            }
            record = await this.getRecordByCondition(request, { slug });
            return record;
        }
    }

}

module.exports = Exercise;