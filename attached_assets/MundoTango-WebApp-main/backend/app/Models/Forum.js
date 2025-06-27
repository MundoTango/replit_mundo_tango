const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');

const RestModel = require("./RestModel");
const User = require("./User");
const constants = require("../config/constants");
const { Op } = require("../Database");

class Forum extends RestModel {

    constructor() {
        super("forums")
    }

    getFields() {
        return [
            'title', 'description'
        ];
    }



    showColumns() {
        return [
            'slug', 'user_slug', 'title', 'description', 'createdAt'
        ];
    }

    softdelete() {
        return true;
    }


    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
        params.user_slug = request.user.slug;
        params.createdAt = new Date()

    }

    async indexQueryHook(query, request, params) {
        query.include = {
            model: User.instance().getModel(),
            required: true,
            as: "Forum_UserSlug"
        }
        query.order = [['createdAt', 'DESC']]

    }

    async getSearchForums(request) {
        const search = request.query?.search || ''
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        const { count, rows } = await this.orm.findAndCountAll({
            where: {
                title: { [Op.like]: `%${search}%` },
                is_activated: true,
                deletedAt: null
            },
            include: {
                model: User.instance().getModel(),
                required: true,
                as: "Forum_UserSlug"
            },
            limit: limit,
            offset: page * limit

        })

        request.query.total = count;
        return rows.map(item => item.toJSON())
    }

    async getUserSlugByPostSlug(post_slug) {
        const result = await this.orm.findOne({
           where: {
             slug: post_slug,
           },
         });
     
         return result?.user_slug
    }

}

module.exports = Forum