const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const sequelize = require("sequelize");
const {BASE_URL} = require("../config/constants");

class UserImages extends RestModel {
    constructor() {
        super("user_images");
    }

    getFields() {
        return ["id", "image_url", "user_id"];
    }

    showColumns() {
        return ["id", "image_url", "user_id"];
    }

    exceptUpdateField() {
        return [""];
    }


    async getRecordByType(type) {
        const record = await this.orm.findOne({
            where: {
                type: type,
                deletedAt: null
            },
            orderBy: ["createdAt", "desc"],
        });

        return _.isEmpty(record) ? {} : record.toJSON();
    }

    async setDefaultImage(id, user_id) {
        await this.orm.update({
            is_default: 0
        }, {
            where: {user_id: user_id}
        })
        return this.orm.update({
            is_default: 1
        }, {
            where: {
                id: id,
                user_id: user_id
            }
        })
    }

    async getUserImage(user_id) {
        const record = await this.orm.findAll({
            where: {
                user_id: user_id
            },
            attributes: [
                [
                    sequelize.literal(`CONCAT('${BASE_URL}/', image_url)`),
                    'media_url'  // Alias as media_url
                ]]
        })

        return _.isEmpty(record) ? [] : record.map(dt => dt.toJSON());
    }

    async createBulkRecord(params) {
        const record = await this.orm.bulkCreate(params)
        return record.map(dt => dt.toJSON())
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

module.exports = UserImages;
