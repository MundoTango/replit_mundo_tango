const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');

const RestModel = require("./RestModel");

class SavePost extends RestModel {

    constructor() {
        super("save_posts")
    }

    getFields() {
        return [
            'user_slug', 'post_slug'
        ];
    }



    showColumns() {
        return [
            'slug', 'user_slug', 'post_slug'
        ];
    }

    softdelete() {
        return true;
    }


    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
        params.user_slug = request.user.slug;
        params.post_slug = request.params.id;
        params.createdAt = new Date();

    }

    async getRecordByUserAndPost(user_slug, post_slug) {
        const record = await this.orm.findOne({
            where: {
                user_slug: user_slug,
                post_slug: post_slug,
                deletedAt: null
            }
        })

        return _.isEmpty(record) ? {} : record.toJSON()
    }

    


}

module.exports = SavePost