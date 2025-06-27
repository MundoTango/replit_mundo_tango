const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const Post = require("./Post");

class HidePosts extends RestModel {
    constructor() {
        super("hide_posts");
    }

    getFields() {
        return ["id", "post_id", "user_id"];
    }

    showColumns() {
        return ["id", "post_id", "user_id"];
    }

    exceptUpdateField() {
        return ["id"];
    }

    async indexQueryHook(query, request, id = {}) {
        query.where = {
            user_id: request.user.id
        }

        query.include = [
            {
                model: Post.instance().getModel(),
                as: 'post',
                attributes: Post.instance().showColumns()
            }
        ]
    }

    async beforeCreateHook(request, params) {
        params.user_id = request.user.id
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }
}

module.exports = HidePosts;
