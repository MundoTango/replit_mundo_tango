const {v4: uuidv4} = require('uuid');
const _ = require("lodash")
const randomstring = require("randomstring");
const moment = require("moment")

const {generateHash} = require("../Helper");
const RestModel = require("./RestModel")
const ResetPassword = require("./ResetPassword")
const emailHandler = require("../Libraries/EmailHandler/EmailHandler");
const {LOGIN_TYPE, API_TOKENS_ENUM, ROLES} = require('../config/enum');
const constants = require('../config/constants');
const {Sequelize} = require('../Database');
const UserApiToken = require('./UserApiToken');
const UserOTP = require('./UserOTP');
const UserImages = require("./UserImages");
const sequelize = require("sequelize");
const TangoActivities = require("./TangoActivities");
const TeachingExperience = require("./TeachingExperience");
const DJExperience = require("./DjExperience");
const OrganizerExperience = require("./OrganizerExperience");
const PerformerExperience = require("./PerformerExperience");
const HostExperience = require("./HostExperience");
const CreatorExperience = require("./CreatorExperience");
const PhotographerExperience = require("./PhotographerExperience");
const TourOperatorExperience = require("./TourOperatorExperience");
const DanceExperience = require("./DanceExperience");
const LearningSource = require("./LearningSource");
const UserQuestions = require("./UserQuestions");


class User extends RestModel {

    constructor() {
        super("users")
    }

    softdelete() {
        return true;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */

    getFields() {
        return [
            'firstname', 'lastname', 'name', 'bio', 'username', 'is_profile_completed', 'form_status', 'email', 'facebook_url', 'mobile_no', 'password',
            'image_url', 'is_mobile_verify', 'mobile_verifyAt', 'is_email_verify', 'email_verifyAt',
            'status', 'is_activated', 'is_blocked', 'login_type', 'platform_type', 'platform_id',
            'createdAt', 'updatedAt', 'deletedAt', 'is_privacy', 'background_url', 'country', 'city'
        ];
    }


    showColumns() {
        return [
            'id', "slug",
            'user_type', 'bio',
            'firstname', 'lastname', 'name', 'username', 'is_profile_completed', 'form_status',
            'email', 'facebook_url', 'mobile_no', 'image_url', 'is_mobile_verify', 'mobile_verifyAt', 'is_email_verify', 'email_verifyAt',
            'status', 'is_activated', 'login_type', 'platform_type', 'platform_id',
            'is_blocked', 'createdAt', 'is_privacy', 'background_url', 'country', 'city'
        ];
    }

    /**
     * omit fields from update request
     */
    exceptUpdateField() {
        return [
            'id',
            'user_type',
            'email', 'mobile_no', 'is_email_verify', 'email_verifyAt', 'is_mobile_verify', 'mobile_verifyAt',
            'login_type', 'platform_type', 'platform_id',
            'createdAt',
        ];
    }

    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} id
     */
    async indexQueryHook(query, request, id = {}) {
    }

    /**
     * Hook for manipulate data input before add data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
        params.user_type = ROLES.USER;
        params.username = params.name;
        params.facebook_url = params.facebook_url
        params.password = generateHash(params.password)
        params.login_type = LOGIN_TYPE.CUSTOM
        params.platform_type = LOGIN_TYPE.CUSTOM
        params.platform_id = null
        params.createdAt = new Date();
    }

    /**
     * Hook for execute command after add public static function called
     * @param {saved record object} record
     * @param {controller request object} request
     * @param {payload object} params
     */
    async afterCreateHook(record, request, params) {
        const otp_record = {};
        if ((constants.EMAIL_VERIFICATION) && record.email) {
            otp_record.email = record.email;
        }

        if ((constants.SMS_VERIFICATION) && record.mobile_no) {
            otp_record.mobile_no = record.mobile_no;
        }
        if (!_.isEmpty(otp_record)) {
            await UserOTP.instance().createRecord(request, otp_record)
        }

        return;
    }

    async updateUserFormStatus(form_status, user_id) {
        return this.orm.update({
            form_status: form_status
        }, {
            where: {
                id: user_id
            }
        })
    }

    /**
     * Hook for manipulate data input before update data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     * @param {integer} int
     */
    async beforeEditHook(request, params, id) {
        console.log("ksdhf")
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
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
            user = await this.getUserByEmail(params.email);
        }
        if (_.isEmpty(user)) {
            socialUser = await this.getUserByPlatformID(params.platform_type, params.platform_id);
        }

        //add new user
        if (_.isEmpty(user)) {
            let password = randomstring.generate(8);
            user = await this.orm.create({
                slug: uuidv4(),
                user_type: ROLES.USER,
                name: params.name,
                firstname: params.firstname || null,
                lastname: params.lastname || null,
                email: params.email,
                mobile_no: params.mobile_no,
                image_url: _.isEmpty(params.image_url) ? null : params.image_url,
                username: params.name,
                password: password,
                is_activated: true,
                is_email_verify: true,
                email_verifyAt: new Date(),
                is_mobile_verify: true,
                mobile_verifyAt: new Date(),
                login_type: params.platform_type,
                platform_type: request.body.platform_type,
                platform_id: request.body.platform_id,
                createdAt: new Date()
            });

        } else {

            //update user
            let updateParams = {
                updated_at: new Date()
            };
            if (!_.isEmpty(params.name)) {
                user.name = updateParams.name = params.name
                user.username = updateParams.username = params.name
            }
            if (!_.isEmpty(params.firstname) && !_.isEmpty(params.lastname)) {
                user.firstname = updateParams.firstname = params.firstname
                user.lastname = updateParams.lastname = params.lastname
            }
            if (!_.isEmpty(params.image_url))
                user.image_url = updateParams.image_url = params.image_url

            await this.orm.update(updateParams, {
                where: {
                    id: user.id
                }
            })
        }
        return user;
    }


    async getUserByEmail(email) {
        let query = await this.orm.findOne({
            where: {
                email: email,
                deletedAt: null
            },
            include: [
                {
                    model: UserImages.instance().getModel()
                }
            ]
        })
        return !_.isEmpty(query) ? query.toJSON() : {};
    }

    async getUserByMobileNo(mobile_no) {
        let query = await this.orm.findOne({
            where: {
                mobile_no: mobile_no,
                deletedAt: null
            }
        })
        return !_.isEmpty(query) ? query.toJSON() : {};
    }

    async getUserByPlatformID(platform_type, platform_id) {
        let query = await this.orm.findOne({
            where: {
                platform_type: platform_type,
                platform_id: platform_id,
                deletedAt: null
            },
            order: [['createdAt', 'DESC']]
        })
        return !_.isEmpty(query) ? query.toJSON() : {};
    }

    async getUserByCity(city) {
        return this.orm.findAll({
            where: {
                city: city
            },
            include: [
                {
                    model: UserImages.instance().getModel(),
                    attributes: ['image_url']
                }
            ],
            attributes: ['name', 'username', 'facebook_url', 'email', 'city']
        })
    }

    async getAllUserWithAssociations(request) {
        let current_user = request?.user
        let query = {...request?.query, user_type: ROLES.USER, deletedAt: null}


        let page = Number(query?.page) || 1;  // Default to page 1 if not specified
        let limit = Number(query?.limit) || 10
        let offset = (page - 1) * limit;

        delete query['page']
        delete query['limit']
        delete query['group_id']

        return this.orm.findAll({
            where: query,
            include: [
                {
                    model: UserImages.instance().getModel(),
                    attributes: ['image_url']
                }
            ],
            attributes: [
                'name',
                'username',
                'facebook_url',
                'email',
                'city',
                'id',
                'slug',
                'createdAt',
                [sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM friends 
                        WHERE 
                        (user_id = :userId AND friend_id = users.id AND status="connected") 
                        OR (user_id = users.id AND friend_id = :userId AND status="connected")
                        
                    )`),
                    'is_friend']
            ],

            ...(request.query.group_id && {
                attributes: [
                    'name',
                    'username',
                    'facebook_url',
                    'email',
                    'city',
                    'id',
                    'slug',
                    'createdAt',

                    [sequelize.literal(`(
                         CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=users.id AND group_members.group_id=${request.query.group_id} AND status='requested'
                            ) THEN 1
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=users.id AND group_members.group_id=${request.query.group_id} AND status='invited'
                            ) THEN 2
                            WHEN EXISTS (
                                SELECT 1 
                                FROM group_members 
                                WHERE 
                                    user_id=users.id AND group_members.group_id=${request.query.group_id} AND status='joined'
                            ) THEN 3
                            ELSE 0
                        END
                       
                    )`), 'is_in_group'],
                    [sequelize.literal(`(
                        SELECT COUNT(*) 
                        FROM friends 
                        WHERE 
                        (user_id = :userId AND friend_id = users.id AND status="connected") 
                        OR (user_id = users.id AND friend_id = :userId AND status="connected")
                        
                    )`),
                        'is_friend']
                ]
            }),

            replacements: {userId: current_user?.id}, // Avoid SQL injection by using replacements
            limit: limit,  // Number of records per page
            offset: offset,    // Skip the first (page - 1) * pageSize records
            order: [['createdAt', 'DESC']]
        })
    }


    async getUserBio(request) {
        let user_id = request?.params?.id
        let user_questions = await UserQuestions.instance().orm.findOne({where: {user_id: user_id}})
        let tango_activity = await TangoActivities.instance().orm.findOne({where: {user_id: user_id}})
        let teacher_experience = await TeachingExperience.instance().orm.findOne({where: {user_id: user_id}})
        let dj_experience = await DJExperience.instance().orm.findOne({where: {user_id: user_id}})
        let organizer_experience = await OrganizerExperience.instance().orm.findOne({where: {user_id: user_id}})
        let performer_experience = await PerformerExperience.instance().orm.findOne({where: {user_id: user_id}})
        let housing_host = await HostExperience.instance().orm.findOne({where: {user_id: user_id}})
        let creator_experience = await CreatorExperience.instance().orm.findOne({where: {user_id: user_id}})
        let photographer_experience = await PhotographerExperience.instance().orm.findOne({where: {user_id: user_id}})
        let tour_operator = await TourOperatorExperience.instance().orm.findOne({where: {user_id: user_id}})
        let dance_experience = await DanceExperience.instance().orm.findOne({where: {user_id: user_id}})
        let learning_sources = await LearningSource.instance().orm.findOne({where: {user_id: user_id}})

        return {
            user_questions,
            tango_activity,
            teacher_experience,
            dj_experience,
            organizer_experience,
            performer_experience,
            housing_host,
            creator_experience,
            photographer_experience,
            tour_operator,
            dance_experience,
            learning_sources
        }
    }

    async forgotPassword(record) {
        let resetPasswordToken = encodeURI(record.id + '|' + moment().valueOf());
        resetPasswordToken = Buffer.from(resetPasswordToken).toString('base64')
        await ResetPassword.instance().createRecord(record.email, resetPasswordToken)

        //send reset password email
        await emailHandler.forgotPassword(record.email, resetPasswordToken);
        return true;
    }

    async getUserByApiToken(api_token, type = API_TOKENS_ENUM.ACCESS) {
        let query = await this.orm.findOne({
            where: {
                user_type: ROLES.USER,
                deletedAt: null
            },
            include: [
                {
                    model: UserApiToken.instance().getModel(),
                    where: {
                        api_token: api_token,
                        type: type,
                        deletedAt: null
                    },
                    order: [['createdAt', 'DESC']]
                },
            ]
        })

        return _.isEmpty(query) ? {} : _.isEmpty(query.toJSON()?.user_api_tokens) ? {} : query.toJSON();
    }

    async updateUser(condition, data) {
        await this.orm.update(data, {
            where: condition
        });
        return true;
    }

    async verifySocial(request, user_id) {
        await this.orm.update(
            {
                email_verifyAt: new Date(),
                is_email_verify: true,
                mobile_verifyAt: new Date(),
                is_mobile_verify: true,
            },
            {
                where: {
                    id: user_id,
                    deletedAt: null
                }
            })
        return true;
    }

    async getResetPassReq(reset_password_token) {
        const token = await ResetPassword.instance().getRecordByResetPasswordToken(reset_password_token);
        if (_.isEmpty(token)) return {};

        let query = await this.orm.findOne({
            where: {
                email: token.email,
                deletedAt: null
            },
            raw: true
        })

        if (_.isEmpty(query)) return {}

        query.reset_passwords = token
        return query;
    }

    async updateResetPassword(user, params) {
        let new_password = generateHash(params.newPassword)
        await this.orm.update({
            password: new_password
        }, {
            where: {
                email: user.email
            }
        })
        await ResetPassword.instance().deleteResetPassToken(user.email, params.resetPassToken);
        return true;
    }


    async getMyProfile(request) {
        const record = await this.orm.findOne({
            where: {
                id: request.user.id,
                deletedAt: null
            },
            include: [
                {
                    model: UserImages.instance().getModel()
                }
            ]
        })

        return _.isEmpty(record) ? {} : record.toJSON()
    }

    async getUserProfile(request) {
        const record = await this.orm.findOne({
            where: {
                id: request.params.id,
                deletedAt: null
            },
            attributes: [
                "image_url",
                "background_url",
                "id",
                "user_type",
                "name",
                "username",
                "firstname",
                "lastname",
                "facebook_url",
                "email",
                "mobile_no",
                "location",
                "city",
                "country",
                "latitude",
                "longitude",
                "is_pushNotification",
                "is_privacy",
                "slug",
                [sequelize.literal(`(
                         CASE 
                            WHEN EXISTS (
                                SELECT 1 
                                FROM friends 
                                WHERE 
                                    user_id = :userId AND friend_id = users.id AND status = 'pending' AND deletedAt IS NULL
                            ) THEN 1
                            WHEN EXISTS (
                                SELECT 1 
                                FROM friends 
                                WHERE 
                                    (user_id = :userId AND friend_id = users.id AND status = 'connected' AND deletedAt IS NULL) 
                                    OR (user_id = users.id AND friend_id = :userId AND status = 'connected' AND deletedAt IS NULL)
                            ) THEN 2
                            WHEN EXISTS (
                                SELECT 1 
                                FROM friends 
                                WHERE 
                                    user_id = users.id AND friend_id = :userId AND status = 'pending' AND deletedAt IS NULL
                            ) THEN 3
                            ELSE 0
                        END
                    )`),
                    'is_friend_request'],
                [
                    sequelize.literal(`(SELECT id FROM friends WHERE 
                            (user_id = :userId AND friend_id = users.id AND deletedAt IS NULL) 
                            OR (user_id = users.id AND friend_id = :userId AND deletedAt IS NULL) LIMIT 1
                        )`),
                    'friend_request_id'
                ],
                [
                    sequelize.literal(`(SELECT COUNT(*) FROM blocked_users WHERE 
                                (user_id = :userId AND blocked_user_id = users.id) 
                                OR (user_id = users.id AND blocked_user_id = :userId) LIMIT 1
                            )`),
                    'is_blocked'
                ]
            ],
            replacements: {userId: request?.user?.id},
            include: [
                {model: UserImages.instance().getModel()},
                {
                    required: false,
                    model: TangoActivities.instance().getModel(),
                    as: 'tango_activities'
                }
            ]
        })

        return _.isEmpty(record) ? {} : record.toJSON()
    }

    async toggleNotification(user_id) {
        await this.orm.update({
            is_pushNotification: Sequelize.literal('case when is_pushNotification=0 then 1 else 0 end')
        }, {
            where: {
                id: user_id
            }
        })
        return;
    }

    async toggleUpdatePrivacy(user_id) {
        console.log(user_id, "user_id_upd")
        await this.orm.update({
            is_privacy: Sequelize.literal('case when is_privacy=0 then 1 else 0 end')
        }, {
            where: {
                id: user_id
            }
        })
        return;
    }

    /**
     * Hook for execute command after edit
     * @param {updated record object} record
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async afterEditHook(record, request, params) {
        let user_question = await UserQuestions.instance().findRecordByUserId(request.user.id)

        if (user_question) {
            let city = user_question?.city.split(",").map(city => city.trim().toLowerCase())
            if (!city.includes(request.body.city.toLowerCase())) {
                await UserQuestions.instance().orm.update({
                    city: user_question?.city + "," + request.body.city
                }, {
                    where: {
                        id: user_question?.id
                    }
                })
            }
        }
    }

    /**
     * Hook for execute command before delete
     * @param {adonis request object} request
     * @param {payload object} params
     * @param {integer} id
     */
    async beforeDeleteHook(request, params, id) {

    }

    /**
     * Hook for execute command after delete
     * @param {adonis request object} request
     * @param {payload object} params
     * @param {integer} id
     */
    async afterDeleteHook(request, params, id) {
        await UserApiToken.instance().deleteRecord(id);
        await UserOTP.instance().deleteRecord(request.user.email, request.user.mobile_no)
    }

    /**
     * Hook for manipulate query of datatable result
     * @param {current mongo query} query
     * @param {adonis request object} request
     */
    async datatable_query_hook(query, request) {

    }


}

module.exports = User;

