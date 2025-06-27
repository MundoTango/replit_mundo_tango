const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");
const randomstring = require("randomstring");
const moment = require("moment");

const { generateHash, extractFields } = require("../Helper");
const RestModel = require("./RestModel");
const ResetPassword = require("./ResetPassword");
const emailHandler = require("../Libraries/EmailHandler/EmailHandler");
const UserApiToken = require("./UserApiToken");
const UserOTP = require("./UserOTP");
const { LOGIN_TYPE, API_TOKENS_ENUM } = require("../config/enum");
const constants = require("../config/constants");
const Follow = require("./Follow");
const { sequelize, Op } = require("../Database");

class User extends RestModel {
  constructor() {
    super("users");
  }

  softdelete() {
    return false;
  }

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */

  getFields() {
    return [
      "first_name",
      "last_name",
      "username",
      "slug",
      "email",
      "mobile_no",
      "gender",
      "password",
      "image_url",
      "is_mobile_verify",
      "mobile_verifyAt",
      "is_email_verify",
      "email_verifyAt",
      "status",
      "is_activated",
      "is_blocked",
      "login_type",
      "platform_type",
      "platform_id",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ];
  }

  showColumns() {
    return [
      "id",
      "user_group_id",
      "user_type",
      "first_name",
      "last_name",
      "username",
      "slug",
      "email",
      "mobile_no",
      "gender",
      "image_url",
      "is_mobile_verify",
      "mobile_verifyAt",
      "is_email_verify",
      "email_verifyAt",
      "platform_type",
      "platform_id",
      "status",
      "is_activated",
      "login_type",
      "is_blocked",
      "createdAt",
    ];
  }

  /**
   * omit fields from update request
   */
  exceptUpdateField() {
    return [
      "id",
      "slug",
      "user_group_id",
      "user_type",
      "email",
      "mobile_no",
      "is_email_verify",
      "email_verifyAt",
      "is_mobile_verify",
      "mobile_verifyAt",
      "platform_type",
      "platform_id",
      "login_type",
      "createdAt",
    ];
  }

  /**
   * Hook for manipulate query of index result
   * @param {current mongo query} query
   * @param {adonis request object} request
   * @param {object} slug
   */
  async indexQueryHook(query, request, slug = {}) {}

  /**
   * Hook for manipulate query of single result
   * @param {current mongo query} query
   * @param {adonis request object} request
   * @param {object} slug
   */
  async singleQueryHook(query, request, slug = {}) {}

  /**
   * Hook for manipulate data input before add data is execute
   * @param {adonis request object} request
   * @param {payload object} params
   */
  async beforeCreateHook(request, params) {
    params.user_group_id = 2;
    params.user_type = "user";
    params.slug = uuidv4();
    params.username = params.name;
    params.password = generateHash(params.password);
    params.login_type = LOGIN_TYPE.CUSTOM;
    params.createdAt = new Date();
  }

  /**
   * Hook for execute command after add public static function called
   * @param {saved record object} record
   * @param {controller request object} request
   * @param {payload object} params
   */
  async afterCreateHook(record, request, params) {
    // const userApiToken = UserApiToken.instance();
    // await userApiToken.createRecord(request, extractFields(record, userApiToken.getFields()))

    if (constants.EMAIL_VERIFICATION == 1 && record.email) {
      const otp_record = {};
      otp_record.email = record.email;
      await UserOTP.instance().createRecord(request, otp_record);
    }

    if (constants.SMS_VERIFICATION == 1 && record.mobile_no) {
      const otp_record = {};
      otp_record.mobile_no = record.mobile_no;
      await UserOTP.instance().createRecord(request, otp_record);
    }

    return;
  }

  /**
   * Hook for manipulate data input before update data is execute
   * @param {adonis request object} request
   * @param {payload object} params
   * @param {string} slug
   */
  async beforeEditHook(request, params, slug) {
    let exceptUpdateField = this.exceptUpdateField();
    exceptUpdateField.filter((exceptField) => {
      delete params[exceptField];
    });

    if (request?.image_url) {
      params.image_url = request.image_url;
    }
  }

  async socialLogin(request) {
    let user;
    let socialUser;
    let params = request.body;

    if (!_.isEmpty(params.email)) {
      socialUser = await this.getUserByEmail(params.email);
    }
    if (_.isEmpty(socialUser)) {
      socialUser = await this.getUserByPlatformID(
        params.platform_type,
        params.platform_id
      );
    }

    //add new user
    if (_.isEmpty(socialUser)) {
      let password = randomstring.generate(8);
      user = await this.orm.create({
        first_name: params.first_name,
        last_name: params.last_name,
        user_group_id: 2,
        user_type: "user",
        email: params.email,
        mobile_no: params.mobile_no,
        image_url: _.isEmpty(params.image_url) ? null : params.image_url,
        username: params.name,
        password: password,
        slug: uuidv4(),
        is_activated: true,
        is_email_verify: true,
        email_verifyAt: new Date(),
        login_type: params.platform_type,
        platform_type: request.body.platform_type,
        platform_id: request.body.platform_id,
        createdAt: new Date(),
      });
    } else {
      //update user
      let updateParams = {
        updated_at: new Date(),
      };
      if (!_.isEmpty(params.name)) {
        socialUser.name = updateParams.name = params.name;
        socialUser.username = updateParams.username = params.name;
      }
      if (!_.isEmpty(params.image_url))
        socialUser.image_url = updateParams.image_url = params.image_url;

      await this.orm.update(updateParams, {
        where: {
          id: socialUser.id,
        },
      });

      user = socialUser;
    }

    //generate api token
    const userApiToken = UserApiToken.instance();
    await userApiToken.createRecord(
      request,
      extractFields(user, userApiToken.getFields())
    );

    return user;
  }

  async getUserByEmail(email) {
    let query = await this.orm.findOne({
      where: {
        email: email,
        deletedAt: null,
      },
    });
    return !_.isEmpty(query) ? query.toJSON() : {};
  }

  async getUserByPlatformID(platform_type, platform_id) {
    let query = await this.orm.findOne({
      where: {
        platform_type: platform_type,
        platform_id: platform_id,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log(
      "Get User By Platform Id : ",
      !_.isEmpty(query) ? query.toJSON() : {}
    );

    return !_.isEmpty(query) ? query.toJSON() : {};
  }

  async forgotPassword(record) {
    let resetPasswordToken = encodeURI(record.id + "|" + moment().valueOf());
    resetPasswordToken = Buffer.from(resetPasswordToken).toString("base64");
    await ResetPassword.instance().createRecord(
      record.email,
      resetPasswordToken
    );

    //send reset password email
    await emailHandler.forgotPassword(record.email, resetPasswordToken);
    return true;
  }

  async getUserByApiToken(api_token, type = API_TOKENS_ENUM.ACCESS) {
    let query = await this.orm.findOne({
      include: [
        {
          model: UserApiToken.instance().getModel(),
          where: {
            api_token: api_token,
            type: type,
            deletedAt: null,
          },
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    return _.isEmpty(query)
      ? {}
      : _.isEmpty(query.toJSON()?.user_api_tokens)
      ? {}
      : query.toJSON();
  }

  async updateUser(condition, data) {
    await this.orm.update(data, {
      where: condition,
    });
    return true;
  }

  async verifySocial(request, slug) {
    await this.orm.update(
      {
        email_verifyAt: new Date(),
        is_email_verify: true,
      },
      {
        where: {
          slug: slug,
          deletedAt: null,
        },
      }
    );
    return true;
  }

  async getResetPassReq(reset_password_token) {
    let query = await this.orm.findOne({
      include: {
        model: ResetPassword.instance().getModel(),
        where: {
          token: reset_password_token,
          deletedAt: null,
        },
        order: [["createdAt", "DESC"]],
      },
    });

    return _.isEmpty(query)
      ? {}
      : _.isEmpty(query.toJSON()?.reset_passwords)
      ? {}
      : query.toJSON();
  }

  async updateResetPassword(user, params) {
    let new_password = generateHash(params.newPassword);
    await this.orm.update(
      {
        password: new_password,
      },
      {
        where: {
          email: user.email,
        },
      }
    );
    await ResetPassword.instance().deleteResetPassToken(
      user.email,
      params.resetPassToken
    );
    return true;
  }

  async getMyProfile(request) {
    const user = request.user;

    const record = await this.orm.findOne({
      where: {
        slug: user.slug,
      },
      attributes: {
        include: [
          [
            // Note the wrapping parentheses in the call below!
            sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM follows AS f
                            WHERE
                                f.followed_user_slug = users.slug
                                AND
                                f.deletedAt is null
                        )`),
            "followers",
          ],
          [
            // Note the wrapping parentheses in the call below!
            sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM follows AS f
                            WHERE
                                f.user_slug = users.slug
                                AND
                                f.deletedAt is null
                        )`),
            "followings",
          ],
        ],
      },
    });

    return _.isEmpty(record) ? {} : record.toJSON();
  }

  async getSearchUser(request, user_slug = "", search_user = "") {
    const page = _.isEmpty(request.query.page)
      ? 0
      : parseInt(request.query.page) - 1;
    const limit = _.isEmpty(request.query.limit)
      ? constants.PAGINATION_LIMIT
      : parseInt(request.query.limit);

    const { count, rows } = await this.orm.findAndCountAll({
      where: {
        slug: { [Op.ne]: user_slug },
        [Op.or]: [
          { name: { [Op.like]: `%${search_user}%` } },
          { username: { [Op.like]: `%${search_user}%` } },
        ],
        deletedAt: null,
      },
      limit: limit,
      offset: page * limit,
    });
    request.query.total = count;
    return rows.map((item) => item.toJSON());
  }

  async updateNotificationStatus(user_slug, status) {
    const udpateRecord = await this.orm.update(
      {
        is_push_notifcation: status,
      },
      { where: { slug: user_slug } }
    );

    return udpateRecord[0];
  }

  async updateFcmToken(user_slug, token) {
    const result = await this.orm.update(
      { fcm_token: token },
      { where: { slug: user_slug } }
    );
    return result[0];
  }

  async getPushNotificationStatus(user_slug) {
    const data = await this.orm.findOne({
      where: {
        slug: user_slug,
      },
    });

    return data.is_push_notifcation;
  }

  async getUserFcmToken(user_slug) {
    const result = await this.orm.findOne({
      where: {
        slug: user_slug,
        deletedAt: null,
        is_push_notifcation: 1,
      },
    });

    return result?.fcm_token || null;
  }

  async validateUser(user_slug = "") {
    const record = await this.orm.findOne({
      where: {
        slug: user_slug,
        is_activated: true,
        is_blocked: false,
        deletedAt: null,
      },
    });
    return _.isEmpty(record) ? {} : record.toJSON();
  }
  /**
   * Hook for execute command after edit
   * @param {updated record object} record
   * @param {adonis request object} request
   * @param {payload object} params
   */
  async afterEditHook(record, request, params) {}

  /**
   * Hook for execute command before delete
   * @param {adonis request object} request
   * @param {payload object} params
   * @param {string} slug
   */
  async beforeDeleteHook(request, params, slug) {}

  /**
   * Hook for execute command after delete
   * @param {adonis request object} request
   * @param {payload object} params
   * @param {string} slug
   */
  async afterDeleteHook(request, params, slug) {}

  /**
   * Hook for manipulate query of datatable result
   * @param {current mongo query} query
   * @param {adonis request object} request
   */
  async datatable_query_hook(query, request) {}
}

module.exports = User;
