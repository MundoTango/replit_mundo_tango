const _ = require("lodash")
const {
    validateAsync,
    validateAll,
    compareHash,
    extractFields,
    generateHash,
    getUserDirectory
} = require("../../../Helper");
const {LOGIN_TYPE, ROLES} = require("../../../config/enum");

const UserApiToken = require("../../../Models/UserApiToken");

const RestController = require("../../RestController");
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const {Op, Sequelize} = require("sequelize");
const UserImages = require("../../../Models/UserImages");
const TangoActivities = require("../../../Models/TangoActivities");
const LearningSource = require("../../../Models/LearningSource");
const TeachingExperience = require("../../../Models/TeachingExperience");
const UserQuestions = require("../../../Models/UserQuestions");
const DjExperience = require("../../../Models/DjExperience");
const OrganizerExperience = require("../../../Models/OrganizerExperience");
const PhotographerExperience = require("../../../Models/PhotographerExperience");
const CreatorExperience = require("../../../Models/CreatorExperience");
const DanceExperience = require("../../../Models/DanceExperience")
const TourOperatorExperience = require("../../../Models/TourOperatorExperience")
const HostExperience = require("../../../Models/HostExperience")
const PerformerExperience = require("../../../Models/PerformerExperience")
const Post = require("../../../Models/Post");
const PostComment = require("../../../Models/PostComment");
const PostShare = require("../../../Models/PostShare");
const EventParticipants = require("../../../Models/EventParticipants");
const Event = require("../../../Models/Event");
const Friend = require("../../../Models/Friend");
const GroupMember = require("../../../Models/GroupMember");
const Group = require("../../../Models/Group");
const BlockedUser = require("../../../Models/BlockedUser");
const ChatRoom = require("../../../Models/ChatRoom");
const User = require("../../../Models/User");
const HidePosts = require("../../../Models/HidePosts");
const DJExperience = require("../../../Models/DjExperience");
const Notification = require("../../../Models/Notification");
const PinGroup = require("../../../Models/PinGroup");
const PostCommentLike = require("../../../Models/PostCommentLike");
const Report = require("../../../Models/Report");
const GroupVisitor = require("../../../Models/GroupVisitor");
const UserTravelling = require("../../../Models/UserTravelling");

class UserController extends RestController {

    constructor() {
        super("Admin")
        this.resource = 'Admin';
        this.request;
        this.response;
        this.params = {};
    }

    async validation(action, id = 0) {
        let validator = [];
        let rules;
        let customMessages = {
            required: 'You forgot to give a :attribute',
            email: "Invalid Email",
            'regex.password': "Password must contain atleast one number and one special character and should be 6 to 16 character long",
            same: ":attribute is not same as password"

        }

        switch (action) {
            case "store":
                rules = {
                    email: 'required|email|unique:users,email',
                    password: `required|regex:/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g`,
                    device_type: "required",
                    device_token: "required"
                }

                validator = await validateAsync(this.request.body, rules)

                break;
            case "update":

                break;
        }
        return validator;
    }

    async beforeUpdateLoadModel() {
        this.params.id = this.request.user.slug;
        if (!this.request.files?.length) return

        try {
            const fileObject = this.request.files;
            const image_url = await FileHandler.doUpload(fileObject[0], getUserDirectory())
            this.request.image_url = image_url
            return
        } catch (err) {
            this.__is_error = true;
            console.log(err)
            return this.sendError(
                "Failed to upload user image",
                {},
                500
            )
        }
    }


    async login({request, response}) {
        this.request = request;
        this.response = response;

        let customMessages = {
            required: 'You forgot to give :attribute',
        }

        let rules = {
            "email": 'required|email',
            "password": 'required',
            "device_type": "required",
            "device_token": "required"
        }
        let validator = await validateAll(request.body, rules, customMessages);
        let validation_error = this.validateRequestParams(validator);
        if (this.__is_error)
            return validation_error;

        let params = this.request.body;
        let user = await this.modal.getAdminByEmail(params.email);


        if (_.isEmpty(user))
            return this.sendError(
                'This email is not associated with any admin',
                {},
                400
            );

        if (!compareHash(params.password, user.password))
            return this.sendError(
                "Incorrect email or password",
                {},
                400
            );


        request.body.user_id = user.id
        await UserApiToken.instance().createRecord(
            request,
            extractFields(request.body, UserApiToken.instance().getFields())
        )
        this.__is_paginate = false;
        await this.sendResponse(
            200,
            'User logged in successfully!',
            user
        );
        return;
    }


    async forgotPassword({request, response}) {
        this.request = request;
        this.response = response;
        let params = request.body;

        let rules = {
            "email": 'required',
        }
        let validator = await validateAll(params, rules);
        let validation_error = this.validateRequestParams(validator);
        if (this.__is_error)
            return validation_error;


        //get user by email
        let user = await this.modal.getAdminByEmail(params.email);
        if (_.isEmpty(user))
            return this.sendError(
                'This email is not associated with any user.',
                {},
                400
            );
        try {
            const record = await this.modal.forgotPassword(user);
        } catch (err) {
            return this.sendError(
                'Failed to send mail',
                {},
                500
            )
        }


        this.__is_paginate = false;
        this.sendResponse(
            200,
            "Reset password link has been sent to your email",
            []
        );
        return;
    }


    async changePassword({request, response}) {
        this.request = request;
        this.response = response;
        //validation rules
        let rules = {
            "current_password": 'required',
            "new_password": [
                'required',
                'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/'
            ],
            "confirm_password": 'required|same:new_password',
        }
        let validator = await validateAll(request.body, rules);
        let validation_error = this.validateRequestParams(validator);
        if (this.__is_error)
            return validation_error;

        let user = this.request.user;
        let params = this.request.body;

        if (user.login_type !== LOGIN_TYPE.CUSTOM) {
            return this.sendError(
                'Not able to change password. Not a custom user',
                {},
                400
            )
        }

        //check old password
        let checkCurrentPass = await compareHash(params.current_password, user.password)
        if (!checkCurrentPass)
            return this.sendError(
                "Invalid current password",
                {},
                400
            );
        //check current and old password
        if (params.current_password == params.new_password)
            return this.sendError(
                "Current password is same as new password",
                {},
                400
            );
        //update new password
        let update_params = {
            password: generateHash(params.new_password)
        }
        //update user
        await this.modal.updateUser({email: user.email}, update_params);

        //remove all api token except current api token
        await UserApiToken.instance().deleteRecord(user.slug)

        this.__is_paginate = false;
        this.__collection = false;
        this.sendResponse(
            200,
            "Password updated successfully",
            {}
        );
        return;
    }


    async getMyProfile({request, response}) {
        this.request = request;
        this.response = response;

        this.resource = 'Admin'
        this.__is_paginate = false;
        return await this.sendResponse(
            200,
            "Profile retreived successfully",
            this.request.user
        )

    }

    async logout({request, response}) {
        this.request = request;
        this.response = response;

        const user_slug = request.user.slug;
        const record = await UserApiToken.instance().deleteRecord(user_slug);

        this.__is_paginate = false;
        this.__collection = false;

        return this.sendResponse(
            200,
            "User Logout Successfully",
            {}
        )
    }

    async getDashboardData({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__is_paginate = false
            this.__collection = false

            let data = await this.modal.getDashboardData(request)

            return this.sendResponse(200, "Record fetched successfully", data)
        } catch (e) {
            return this.sendError(e, e?.message, 500)
        }
    }

    async getAllUsers({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let {page, limit, query, role} = request.query

            page = parseInt(page) || 1
            limit = parseInt(limit) || 10

            let offset = (page - 1) * limit

            let where = {}
            if (query) {
                where = {
                    [Op.or]: [
                        {firstname: {[Op.like]: `%${query}%`}},
                        {lastname: {[Op.like]: `%${query}%`}},
                        {name: {[Op.like]: `%${query}%`}},
                        {email: {[Op.like]: `%${query}%`}},
                    ]
                }
            }
            where['user_type'] = ROLES.USER

            let roleFilter = {}
            if (role) {
                if (role == "teacher") roleFilter = {teacher_at: {[Op.ne]: null}}
                else if (role == "dj") roleFilter = {dj_at: {[Op.ne]: null}}
                else if (role == "photographer") roleFilter = {photographer_at: {[Op.ne]: null}}
                else if (role == "host") roleFilter = {host_at: {[Op.ne]: null}}
                else if (role == "organizer") roleFilter = {organizer_at: {[Op.ne]: null}}
                else if (role == "creator") roleFilter = {creator_at: {[Op.ne]: null}}
                else if (role == "performer") roleFilter = {performer_at: {[Op.ne]: null}}
                else if (role == "tour_operator") roleFilter = {tour_operator_at: {[Op.ne]: null}}
                else if (role == "social_dancer") roleFilter = {social_dancer: true}
            }

            where['deletedAt'] = null

            let data = await this.modal.orm.findAndCountAll({
                where: where,
                offset: offset,
                limit: limit,
                order: [['createdAt', 'DESC']],
                distinct: true,
                include: [
                    {
                        required: false,
                        model: UserImages.instance().getModel(),
                        attributes: ['id', 'image_url']
                    },
                    {
                        required: false,
                        model: TangoActivities.instance().getModel(),
                        as: 'tango_activities',
                        ...(role && {...roleFilter, required: true})
                    }
                ]
            })
            this.resource = 'GetAllUsersAdmin'
            this.__is_paginate = true;
            this.request.query.total = data.count
            return await this.sendResponse(
                200,
                "Record fetched successfully",
                data.rows
            )
        } catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )

        }
    }

    async getUserDetail({request, response}) {
        try {
            this.request = request;
            this.response = response;


            let data = await this.modal.orm.findOne({
                where: {
                    id: request.params.id
                },
                include: [
                    {
                        required: false,
                        model: UserImages.instance().getModel(),
                        attributes: ['id', 'image_url']
                    },
                    {
                        required: false,
                        model: TangoActivities.instance().getModel(),
                        as: 'tango_activities'
                    },
                    {
                        required: false,
                        model: LearningSource.instance().getModel(),
                    },
                    {
                        required: false,
                        model: TeachingExperience.instance().getModel(),
                        as: 'teaching_experiences'
                    },
                    {
                        required: false,
                        model: UserQuestions.instance().getModel(),
                        as: 'user_questions'
                    },
                    {
                        required: false,
                        model: DjExperience.instance().getModel(),
                        as: 'dj_experiences'
                    },
                    {
                        required: false,
                        model: OrganizerExperience.instance().getModel(),
                        as: 'organizer_experiences'
                    },
                    {
                        required: false,
                        model: PhotographerExperience.instance().getModel(),
                        as: 'photographer_experiences'
                    },
                    {
                        required: false,
                        model: CreatorExperience.instance().getModel(),
                        as: 'creator_experiences'
                    },
                    {
                        required: false,
                        model: PerformerExperience.instance().getModel(),
                        as: 'performer_experiences'
                    },
                    {
                        required: false,
                        model: DanceExperience.instance().getModel(),
                        as: 'dance_experiences'
                    },
                    {
                        required: false,
                        model: TourOperatorExperience.instance().getModel(),
                        as: 'tour_operator_experiences'
                    },
                    {
                        required: false,
                        model: HostExperience.instance().getModel(),
                        as: 'host_experiences'
                    }
                ],
                attributes: {
                    exclude: ['mobile_verifyAt', 'is_mobile_verify', 'email_verifyAt', 'password', 'is_profile_completed', 'is_email_verify']
                }
            })

            this.__collection = false
            this.__is_paginate = false;
            return await this.sendResponse(
                200,
                "Record fetched successfully",
                data
            )
        } catch (err) {
            console.log(err);
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )

        }
    }

    async blockedUser({request, response}) {
        try {
            this.request = request;
            this.response = response;

            this.__is_paginate = false;

            await this.modal.orm.update({
                is_blocked: Sequelize.literal('case when is_blocked=0 then 1 else 0 end')
            }, {
                where: {
                    id: request.params.id
                }
            })

            return await this.sendResponse(
                200,
                "User block status updated.",
                {}
            )
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async changePasswordForUser({request, response}) {
        this.request = request;
        this.response = response;
        //validation rules
        let rules = {
            "new_password": [
                'required',
                'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/'
            ],
            "confirm_password": 'required|same:new_password',
        }
        let validator = await validateAll(request.body, rules);
        let validation_error = this.validateRequestParams(validator);
        if (this.__is_error)
            return validation_error;

        let params = this.request.body;

        //update new password
        let update_params = {
            password: generateHash(params.new_password)
        }
        //update user
        await this.modal.updateUser({id: request.params.id}, update_params);

        //remove all api token except current api token
        await UserApiToken.instance().deleteRecord(request.params.id)

        this.__is_paginate = false;
        this.__collection = false;
        this.sendResponse(
            200,
            "Password updated successfully",
            {}
        );
        return;
    }

    async afterDestoryLoadModel() {
        let user = await User.instance().orm.findOne({where: {id: this.request.params.id}, raw: true})

        await Post.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await PostComment.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await PostShare.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await PostCommentLike.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await EventParticipants.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await Event.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await Friend.instance().orm.destroy({
            where: {
                [Op.or]: [
                    {friend_id: this.request.params.id},
                    {user_id: this.request.params.id}
                ]
            },
            force: true
        })
        await GroupMember.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await Group.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await GroupVisitor.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await BlockedUser.instance().orm.destroy({
            where: {
                [Op.or]: [
                    {user_id: this.request.params.id},
                    {blocked_user_id: this.request.params.id}
                ]
            },
            force: true
        })
        await Notification.instance().orm.destroy({
            where: {
                [Op.or]: [
                    {user_id: this.request.params.id},
                    {sender_id: this.request.params.id}
                ]
            },
            force: true
        })
        await ChatRoom.instance().orm.destroy({
            where: {user_slug: user?.slug},
            force: true
        })
        await HidePosts.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await PinGroup.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })
        await Report.instance().orm.destroy({
            where: {user_id: this.request.params.id},
            force: true
        })

        await UserQuestions.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await TangoActivities.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await TeachingExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await DJExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await OrganizerExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await PerformerExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await HostExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await CreatorExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await PhotographerExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await TourOperatorExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await DanceExperience.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await LearningSource.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await UserImages.instance().orm.destroy({where: {user_id: this.request.params.id}})
        await UserTravelling.instance().orm.destroy({where: {user_id: this.request.params.id}})

    }
}

module.exports = UserController