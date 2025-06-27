const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");

const RestModel = require("./RestModel");
const User = require("./User");

class CommentPost extends RestModel {
  constructor() {
    super("forum_comments");
  }

  getFields() {
    return ["user_slug", "post_slug"];
  }

  showColumns() {
    return ["comment"];
  }

  softdelete() {
    return true;
  }

  async getComments(post_slug) {
    return this.orm.findAll({
      include: {
        model: User.instance().getModel(),
        attributes: ["name", "image_url"],
      },
      where: {
        post_slug,
      },
    });
  }

  async createComment({ Post_slug, Comment, created_by }) {
    return this.orm.create({
      post_slug: Post_slug,
      comment: Comment,
      created_by: created_by,
    });
  }

  // async beforeCreateHook(request, params) {
  //     params.slug = uuidv4();
  //     params.user_slug = request.user.slug;
  //     params.post_slug = request.params.id;
  //     params.createdAt = new Date();

  // }

  // async getRecordByUserAndPost(user_slug, post_slug) {
  //     const record = await this.orm.findOne({
  //         where: {
  //             user_slug: user_slug,
  //             post_slug: post_slug,
  //             deletedAt: null
  //         }
  //     })

  //     return _.isEmpty(record) ? {} : record.toJSON()
  // }
}

module.exports = CommentPost;
