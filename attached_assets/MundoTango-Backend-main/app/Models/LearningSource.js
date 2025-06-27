const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class LearningSource extends RestModel {
    constructor() {
        super("learning_sources");
    }

    getFields = () => {
        return [
            'id', 'user_id', 'first_teacher', 'leading_teachers', 'chacarera_skill',
            'tango_story', 'zamba_skill', 'visited_buenos_aires',
            'visited_buenos_aires_at', 'visited_buenos_aires_end_at', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'user_id', 'first_teacher', 'leading_teachers', 'chacarera_skill',
            'tango_story', 'zamba_skill', 'visited_buenos_aires',
            'visited_buenos_aires_at', 'visited_buenos_aires_end_at', 'createdAt'
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
        await this.orm.destroy({
            where: {
                user_id: request.user.id
            },
            force: true
        })
        const record = await this.orm.create({
            first_teacher: params?.first_teacher || "",
            leading_teachers: params?.leading_teachers ? params?.leading_teachers.join(",") : "",
            chacarera_skill: params?.chacarera_skill || "",
            tango_story: params?.tango_story || "",
            zamba_skill: params?.zamba_skill || "",
            visited_buenos_aires: params?.visited_buenos_aires || false,
            visited_buenos_aires_at: params?.visited_buenos_aires_at ? params?.visited_buenos_aires_at.join(",") : "",
            visited_buenos_aires_end_at: params?.visited_buenos_aires_end_at ? params?.visited_buenos_aires_end_at.join(",") : "",
            user_id: request?.user?.id
        })

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async storeBulkRecord(request) {
        let params = request.body
        let bodyArr = []
        await this.orm.destroy({
            where: {
                user_id: request?.user?.id
            }
        })
        for (let i = 0; i < params.length; i++) {
            bodyArr.push({
                first_teacher: params[i]?.first_teacher,
                leading_teachers: params[i]?.leading_teachers.join(","),
                chacarera_skill: params[i]?.chacarera_skill,
                tango_story: params[i]?.tango_story,
                zamba_skill: params[i]?.zamba_skill,
                visited_buenos_aires: params[i]?.visited_buenos_aires,
                visited_buenos_aires_at: params[i]?.visited_buenos_aires_at.join(","),
                visited_buenos_aires_end_at: params[i]?.visited_buenos_aires_end_at.join(","),
                user_id: request?.user?.id
            })
        }
        const record = await this.orm.bulkCreate(bodyArr)


        return _.isEmpty(record) ? {} : record;
    }

    async findRecordByUserId(user_id) {
        const record = await this.orm.findOne({
            where: {
                user_id: user_id
            },

        })

        return _.isEmpty(record) ? null : record;
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

module.exports = LearningSource;
