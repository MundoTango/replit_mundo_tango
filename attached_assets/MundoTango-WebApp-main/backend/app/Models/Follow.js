const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');

const RestModel = require("./RestModel");

class Follow extends RestModel {

    constructor() {
        super("follows")
    }

    getFields() {
        return [
            'user_slug', 'followed_user_slug'
        ];
    }



    showColumns() {
        return [
            'slug', 'user_slug', 'followed_user_slug'
        ];
    }

    softdelete() {
        return true;
    }


    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
        params.user_slug = request.user.slug;
        params.followed_user_slug = request.params.id;
        params.createdAt = new Date()

    }

    async afterCreateHook(record, request, params) {
    }

    async getRecordByUsers(user_slug, followed_user_slug) {
        const record = await this.orm.findOne({
            where: {
                user_slug: user_slug,
                followed_user_slug: followed_user_slug,
                deletedAt: null
            }
        })

        return _.isEmpty(record) ? {} : record.toJSON()
    }



}

module.exports = Follow