const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")

class Page extends RestModel {
    constructor() {
        super("pages");
    }

    getFields = () => {
        return [
            'id', 'slug', 'url', 'title', 'content', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'slug', 'url', 'title', 'content', 'createdAt', 'updatedAt'
        ];
    }

    exceptUpdateField = () => {
        return ['id'];
    }
    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async getContentBySlug(slug) {
        const record = await this.orm.findOne({
            where: {
                slug: slug
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async createRecord(request, params) {
        let data = await this.orm.create(params)
        return data;
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

module.exports = Page;
