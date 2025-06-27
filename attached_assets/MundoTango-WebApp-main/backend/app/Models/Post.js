const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const RestModel = require("./RestModel");

class Post extends RestModel {
  constructor() {
    super("posts");
  }

  getFields() {
    return ["user_slug", "post_slug"];
  }

  showColumns() {
    return ["slug", "user_slug"];
  }

  softdelete() {
    return true;
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

module.exports = Post;
