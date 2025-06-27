const _ = require("lodash")
const {LOGIN_TYPE, GENDER_ENUM, API_TOKENS_ENUM, UPLOAD_DIRECTORY} = require("../../../config/enum.js");
const constants = require("../../../config/constants.js");
const {
    validateAll,
    compareHash,
    extractFields,
    generateHash,
    validateAsync,
    getUploadDirectoryPath
} = require("../../../Helper/index.js");

const UserImages = require('../../../Models/UserImages')
const User = require('../../../Models/User')


const FileHandler = require("../../../Libraries/FileHandler/FileHandler.js");
const SocialUser = require("../../../Models/SocialUser.js");
const UserApiToken = require("../../../Models/UserApiToken.js");
const UserOTP = require("../../../Models/UserOTP.js");
const SavePost = require("../../../Models/SavePost.js");

const RestController = require("../../RestController");
const {BASE_URL} = require("../../../config/constants");
const Post = require("../../../Models/Post");
const Attachment = require("../../../Models/Attachment");
const {Op, HasMany} = require("sequelize");
const UserTravelling = require("../../../Models/UserTravelling");
const Friend = require("../../../Models/Friend");
const sequelize = require("sequelize");
const Event = require("../../../Models/Event");
const TangoActivities = require("../../../Models/TangoActivities");
const Group = require("../../../Models/Group");
const PostComment = require("../../../Models/PostComment");
const PostShare = require("../../../Models/PostShare");
const EventParticipants = require("../../../Models/EventParticipants");
const GroupMember = require("../../../Models/GroupMember");
const BlockedUser = require("../../../Models/BlockedUser");
const ChatRoom = require("../../../Models/ChatRoom");
class UserController extends RestController {

    constructor(model = 'User') {
        super(model)
        this.resource = 'User';
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }


    async validation(action, id = 0) {
        let validator = [];
        let rules;
        let customMessages = {
            required: 'You forgot to give a :attribute',
            'regex.password': "Password must contain atleast one number and one special character and should be 6 to 16 character long",
            same: ":attribute is not same as password"

        }

        switch (action) {
            case "store":
                rules = {
                    username: "min:2|max:45",
                    name: "min:2|max:45",
                    email: 'required|email|unique:users,email|max:250',
                    password: [
                        'required',
                        'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/',
                        'max:30'
                    ],
                    confirm_password: 'required|same:password',
                }

                validator = await validateAsync(this.request.body, rules, customMessages)
                break;
            case "update":
                rules = {
                    firstname: 'min:2|max:45',
                    lastname: 'min:2|max:45',
                    username: "min:2|max:45"
                }
                break;
        }
        return validator;
    }

    async beforeUpdateLoadModel() {
        const params = this.request.body;

        this.params.id = this.request.user.id;
        if (!this.request.files?.length) return

        try {
            const fileObject = this.request.files;
            for (let object of fileObject) {
                if (object?.fieldname == "image_url") {
                    console.log("image_url")
                    const image_url = await FileHandler.doUpload(object, getUploadDirectoryPath(UPLOAD_DIRECTORY.USER))
                    console.log(image_url, "image")
                    // await User.instance().orm.update({image_url}, {
                    //     where: {user_id: this.request.user.id}
                    // })
                    params.image_url = UPLOAD_DIRECTORY.USER + "/" + image_url
                    let new_image = await Attachment.instance().createRecord(this.request, {
                        user_id: this.request.user.id,
                        image_url: UPLOAD_DIRECTORY.USER + "/" + image_url
                    })

                    await UserImages.instance().setDefaultImage(new_image?.id, this.request?.user?.id)
                } else if (object?.fieldname == "background_url") {
                    const image_url = await FileHandler.doUpload(object, getUploadDirectoryPath(UPLOAD_DIRECTORY.USER))
                    params.background_url = UPLOAD_DIRECTORY.USER + "/" + image_url
                }
            }

            return
        } catch (err) {
            this.__is_error = true;
            return this.sendError(
                "Failed to upload user image",
                {},
                500
            )
        }
    }

    async afterStoreLoadModel(record) {
        this.__collection = false;
        this.response_message = "User Created Successfully";
        // return {}
    }

    async beforeDestroyLoadModel() {
        console.log('Before Destroy Load Model ')
        this.params.id = this.request.user.id
    }



    async login({request, response}) {
        try {
            this.request = request;
            this.response = response;

            let customMessages = {
                required: 'You forgot to give :attribute',
                email: "Invalid Email",
                'regex.password': "Password must contain atleast one number and one special character and should be 6 to 16 character long",
            }

            let rules = {
                "email": 'required|email',
                "password": 'required',
                "device_type": "required|in:web,ios,android",
                "device_token": "required"
            }
            let validator = await validateAll(request.body, rules, customMessages);
            let validation_error = this.validateRequestParams(validator);
            if (this.__is_error)
                return validation_error;

            let params = this.request.body;
            let user = await this.modal.getUserByEmail(params.email);

            if (_.isEmpty(user))
                return this.sendError(
                    'This email is not associated with any user',
                    {},
                    400
                );

            if (!compareHash(params.password, user.password))
                return this.sendError(
                    "Incorrect email or password",
                    {},
                    400
                );

            if (user.login_type !== LOGIN_TYPE.CUSTOM) {
                return this.sendError(
                    "Email already registered from different platform.",
                    {},
                    403
                );
            }

            if (!user.is_activated) {
                return this.sendError(
                    "You have been de-activated by Admin. Kindly contact the administrator",
                    {},
                    403
                );
            }

            if (user.is_blocked) {
                return this.sendError(
                    "You have been blocked by Admin. Kindly contact the administrator.",
                    {},
                    403
                );
            }

            if ((constants.SMS_VERIFICATION && !user.is_mobile_verify) || (constants.EMAIL_VERIFICATION && !user.is_email_verify)) {

                const payload = {}
                if (user.email) {
                    payload.email = user.email;
                }
                if (user.mobile_no) {
                    payload.mobile_no = user.mobile_no
                }
                await UserOTP.instance().createRecord(this.request, payload);
                return this.sendError(
                    "Email or mobile no is not verified.",
                    payload,
                    428
                );
            }

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
        } catch (err) {
            console.log(err);
            return this.sendError(
                'Internal server error. Please try again later.',
                {},
                500
            )
        }
    }


    async socialLogin({request, response}) {
        this.request = request;
        this.response = response;
        const params = request.body;
        let socialUser;

        let customMessages = {
            required: 'You forgot to give :attribute',
            email: "Invalid Email",
            'regex.password': "Password must contain atleast one number and one special character and should be 6 to 16 character long",
        }

        let rules = {
            "email": 'email|max:50',
            "platform_id": "required|max:255",
            "platform_type": "required|in:facebook,google,apple",
            "device_type": "required|in:web,android,ios",
            "device_token": "required",

        }
        let validator = await validateAll(params, rules, customMessages);
        let validation_error = this.validateRequestParams(validator);
        if (this.__is_error)
            return validation_error;


        if (!_.isEmpty(params.email)) {
            await SocialUser.instance().findOrCreateRecord(this.request, extractFields(params, SocialUser.instance().getFields()));
        } else {
            const saved_user = await SocialUser.instance().getUserRecord(params.platform_id, params.platform_type)
            if (!_.isEmpty(saved_user)) {
                params.email = saved_user.email;
                request.body.email = saved_user.email;
                request.body.name = saved_user.name
            }
        }
        if (!_.isEmpty(params.email)) {
            socialUser = await this.modal.getUserByEmail(params.email);
        }

        // if (_.isEmpty(socialUser)) {
        //     socialUser = await this.modal.getUserByPlatformID(params.platform_type, params.platform_id);
        // }

        if (_.isEmpty(socialUser) && !params.email) {
            return this.sendError(
                "Not able to sign up without email",
                {},
                403
            );
        }

        if (!_.isEmpty(socialUser)) {
            if (socialUser.login_type !== params.platform_type) {
                // return this.sendError(
                //     "Email already registered from different platform.",
                //     {},
                //     400
                // );
                await this.modal.updateRecord(request, {
                    platform_id: params?.platform_id,
                    platform_type: params.platform_type
                }, socialUser?.id)
            }

            if (!socialUser.is_activated) {
                return this.sendError(
                    "You have been de-activated by Admin. Kindly contact the administrator",
                    {},
                    403
                );
            }
            console.log("Block Status", socialUser.is_blocked)

            if (socialUser.is_blocked) {
                return this.sendError(
                    "You have been blocked by Admin. Kindly contact the administrator.",
                    {},
                    403
                );
            }
        }


        let user = await this.modal.socialLogin(request);

        /*const invite_count = await Invite.instance().getInviteCount(user.id);
        if (invite_count < constants.MIN_INVITE_REQUIRED) {
            request.body.slug = user.slug
            request.body.type = API_TOKENS_ENUM.INVITE
            await UserApiToken.instance().createRecord(
                request,
                extractFields(request.body, UserApiToken.instance().getFields())
            )

            return this.sendError(
                "Please invite user to login.",
                { invite_count: invite_count, api_token: Buffer.from(this.request.api_token).toString('base64') },
                430
            );
        }*/


        //generate api token
        const userApiToken = UserApiToken.instance()
        user.user_id = user.id;
        await userApiToken.createRecord(request, extractFields(user, userApiToken.getFields()))


        this.__is_paginate = false;
        await this.sendResponse(
            200,
            "User logged in successfully",
            user
        );
        return;
    }

    async setNewPassword({request, response}) {
        this.request = request;
        this.response = response;
        const user = this.request.user;
        const params = this.request.body

        let rules = {
            "new_password": [
                'required',
                'regex:/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/'
            ],
            "confirm_password": 'required|same:new_password',
        }
        let validator = await validateAll(params, rules);
        let validation_error = this.validateRequestParams(validator);
        if (this.__is_error)
            return validation_error;

        //update new password
        let update_params = {
            password: generateHash(params.new_password)
        }
        //update user
        await this.modal.updateUser({email: user.email}, update_params);
        await UserApiToken.instance().deleteRecord(user.id)
        await UserOTP.instance().deleteRecord(user?.email, user?.mobile_no)

        this.__is_paginate = false;
        return this.sendResponse(
            200,
            'Password reset successfully',
            {}
        )
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
        let user = await this.modal.getUserByEmail(params.email);
        if (_.isEmpty(user))
            return this.sendError(
                'This email is not associated with any user.',
                {},
                400
            );
        try {
            await UserOTP.instance().createRecord(
                this.request,
                extractFields(user, UserOTP.instance().getFields())
            )
            // const record = await this.modal.forgotPassword(user);
        } catch (err) {
            return this.sendError(
                'Failed to send mail',
                {},
                500
            )
        }

        this.__collection = false;
        this.__is_paginate = false;
        this.sendResponse(
            200,
            "Otp has been sent to your email",
            {}
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
        await UserApiToken.instance().deleteRecord(user.id)

        this.__is_paginate = false;
        this.__collection = false;
        this.sendResponse(
            200,
            "Password updated successfully",
            {}
        );
        return;
    }


    async toggleNotification({request, response}) {
        try {
            this.request = request;
            this.response = response;

            await this.modal.toggleNotification(request.user.id);
            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Notification status updated successfully",
                {}
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

    async toggleUpdatePrivacy({request, response}) {
        try {
            this.request = request;
            this.response = response;

            console.log("toggleUpdatePrivacy")
            await this.modal.toggleUpdatePrivacy(request.user.id);
            this.__is_paginate = false;
            this.__collection = false
            return await this.sendResponse(
                200,
                "Privacy status updated successfully",
                {}
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


    async getMyProfile({request, response}) {
        this.request = request;
        this.response = response;

        const user = await this.modal.getMyProfile(request);
        this.resource = 'MyProfile'
        this.__is_paginate = false;
        return await this.sendResponse(
            200,
            "Profile retreived successfully",
            user
        )

    }

    async getUserProfile({request, response}) {
        this.request = request;
        this.response = response;
        const user = await this.modal.getUserProfile(request);
        this.resource = 'UserProfile'
        // this.__collection = false
        this.__is_paginate = false;
        return await this.sendResponse(
            200,
            "Profile retrieved successfully",
            user
        )

    }

    async logout({request, response}) {
        this.request = request;
        this.response = response;

        const id = request.user.id;
        const record = await UserApiToken.instance().deleteRecord(id);

        this.__is_paginate = false;
        this.__collection = false;

        return this.sendResponse(
            200,
            "User Logout Successfully",
            {}
        )
    }

    async addUserImages({request, response}) {
        try {
            this.request = request
            this.response = response
            let imageUrls = []
            const fileObject = this.request.files;
            for (let i = 0; i < fileObject.length; i++) {
                let image_url = await FileHandler.doUpload(fileObject[i], getUploadDirectoryPath(UPLOAD_DIRECTORY.USER))
                imageUrls.push({
                    user_id: this.request.user.id,
                    image_url: UPLOAD_DIRECTORY.USER + "/" + image_url
                })
            }

            let data = await UserImages.instance().createBulkRecord(imageUrls)

            await UserImages.instance().setDefaultImage(data[0]?.id, request?.user?.id)

            // form status -> 1
            await this.modal.updateUserFormStatus(1, request?.user?.id)

            data = await UserImages.instance().orm.findAll({
                where: {
                    user_id: request?.user?.id
                }
            })

            this.__is_paginate = false;
            this.__collection = false;

            return this.sendResponse(
                200,
                "User images added Successfully",
                data
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

    async getUserImages({request, response}) {
        try {
            this.request = request
            this.response = response
            let data = await UserImages.instance().getUserImage(request?.user?.id)

            for (let i = 0; i < data.length; i++) {
                data[i]['image_url'] = `${BASE_URL}/${data[i]?.image_url}`
            }

            this.__is_paginate = false;
            this.__collection = false;

            return this.sendResponse(
                200,
                "User images fetched successfully.",
                data
            );

        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async changeDefaultImage({request, response}) {
        try {
            this.request = request
            this.response = response


            await UserImages.instance().setDefaultImage(request.params.image_id, request?.user?.id)

            let data = await UserImages.instance().orm.findAll({
                where: {
                    user_id: request?.user?.id
                }
            })

            this.__is_paginate = false;
            this.__collection = false;

            return this.sendResponse(
                200,
                "User images fetched successfully.",
                data
            );

        } catch (e) {
            console.log(e?.message)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async guideLineAccept({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__is_paginate = false;
            this.__collection = false;

            let updateStatus = await this.modal.updateUser({id: request?.user?.id}, {
                is_guideline: true
            })

            const user = await this.modal.getMyProfile(request);

            return this.sendResponse(
                200,
                "Guideline accepted successfully.",
                updateStatus ? user : {}
            );
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async getUserMedia({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__is_paginate = false;
            this.__collection = false;
            let userImages = []
            if (!request.query.type) return this.sendError(
                "type is required.",
                {},
                400
            )
            if (request.query.type === "image") {
                userImages = await UserImages.instance().getUserImage(request.user?.id)
            }

            let posts = await Post.instance().orm.findAll({
                where: {
                    user_id: request?.user?.id
                },
                attributes: ['id']
            })

            let postIds = posts.map(post => post.id);

            let attachments = await Attachment.instance().orm.findAll({
                where: {
                    instance_id: {[Op.in]: postIds},
                    instance_type: 'post',
                    media_type: request.query.type
                },
                attributes: ['media_url']
            })

            attachments = attachments.map(dt => dt.toJSON())

            let media_arr = [...userImages, ...attachments]
            return this.sendResponse(
                200,
                "Record fetched successfully",
                media_arr
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async getMemberInCity({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__is_paginate = false;
            this.__collection = false;

            let data = await this.modal.getUserByCity(request?.query.city)

            return this.sendResponse(
                200,
                "Record fetched successfully",
                data
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }


    async getAllUsers({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false;

            let data = await this.modal.getAllUserWithAssociations(request)
            this.request.query.total = await this.modal.orm.count()
            console.log(this.request.query.limit, 'dsfdsf')
            this.__is_paginate = true
            return this.sendResponse(
                200,
                "Record fetched successfully",
                data
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async getUserTimeLine({request, response}) {
        try {
            this.request = request
            this.response = response

            let {user_id} = request.params

            let user_images = await UserImages.instance().getUserImage(user_id)

            // Fetch posts by user_id
            const posts = await Post.instance().orm.findAll({
                where: {user_id},
                attributes: [
                    'id',
                    'total_likes',
                    'total_comments',
                    [sequelize.literal(`(SELECT count(*) from post_likes as PL where PL.post_id = posts.id AND PL.user_id = :userId)`), 'is_liked']
                ],
                replacements: {userId: request?.user?.id}
            });
            const postsJSON = posts.map(post => post.toJSON());
            const postIds = postsJSON.map(post => post.id);

            // Fetch all attachments for the retrieved posts
            const postImages = await Attachment.instance().orm.findAll({
                where: {
                    instance_id: {[Op.in]: postIds},
                    instance_type: 'post',
                    media_type: 'image'
                },
                attributes: ['instance_id', 'media_url']
            });
            const postImagesJSON = postImages.map(image => image.toJSON());

            // saved post
            const saved_post = await SavePost.instance().orm.findAll({
                where: {
                    user_id: user_id
                },
                include: [
                    {
                        model: Post.instance().getModel(),
                        as: 'post',
                        attributes: [
                            'total_comments',
                            'total_likes',
                            'total_shares',
                            [
                                sequelize.literal(`
                                   (SELECT count(*) 
                                   FROM post_likes AS PL 
                                   WHERE PL.post_id = post.id 
                                   AND PL.user_id = ${request?.user?.id})`), // Direct string interpolation for userId
                                'is_liked'
                            ]
                        ],
                        include: [
                            {
                                model: Attachment.instance().getModel(),
                                association: new HasMany(Post.instance().getModel(), Attachment.instance().getModel(), {foreignKey: "instance_id"}),
                                where: {
                                    instance_type: 'post'
                                },
                                attributes: ['media_url']
                            }
                        ],
                    },
                ],
            })
            let saved_post_arr = saved_post.map(dt => dt?.post)
            // Map images by post ID for faster lookup
            const imagesByPostId = postImagesJSON.reduce((acc, image) => {
                if (!acc[image.instance_id]) {
                    acc[image.instance_id] = [];
                }
                acc[image.instance_id].push(image.media_url);
                return acc;
            }, {});

            // Merge images with corresponding posts
            const formattedPosts = postsJSON.map(post => ({
                ...post,
                media_urls: imagesByPostId[post.id] || []
            }));

            let post_video = await Attachment.instance().orm.findAll({
                where: {
                    instance_id: {[Op.in]: postIds},
                    instance_type: 'post',
                    media_type: "video"
                },
                attributes: ['media_url']
            })

            let user_travels = await UserTravelling.instance().findAllRecordByCondition({
                user_id: user_id
            })

            // get User Friends
            let friends = await Friend.instance().getUserFriend(user_id)

            let user = await this.modal.orm.findOne({
                where: {
                    id: request?.params?.user_id
                },
                attributes: ['id', 'user_type', 'firstname', 'lastname', 'email', 'facebook_url', 'mobile_no', 'location', 'city', 'country', 'image_url']
            })

            this.__collection = false;
            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                {
                    photos_about_you: [...formattedPosts, ...saved_post_arr],
                    your_photos: user_images,
                    // images: images,
                    videos: post_video,
                    user_travels: user_travels,
                    friends: friends,
                    user: user
                }
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async getUserAbout({request, response}) {
        try {
            this.request = request
            this.response = response


            let data = await this.modal.getUserBio(request)
            this.__collection = false;

            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                data
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async getCityAbout({request, response}) {
        try {
            this.request = request
            this.response = response
            let event = await Event.instance().getRecordById(request, request.params.id)
            let all_users = await this.modal.orm.findAndCountAll({
                where: {
                    city: event?.city
                },
                include: [
                    {
                        required: true,
                        model: TangoActivities.instance().getModel(),
                        as: 'tango_activities'
                    }
                ],
                attributes: [
                    'image_url',
                    'name',
                    'username',
                    'facebook_url',
                    'email',
                    'city',
                    'id',
                    'slug',
                    'latitude',
                    'longitude',
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
                replacements: {userId: request.user?.id},
            })

            let teachers = all_users?.rows?.filter(dt => {
                let record = dt.toJSON()
                return record?.tango_activities?.teacher_at != null
            })
            let dancers = all_users?.rows?.filter(dt => {
                let record = dt.toJSON()
                return record?.tango_activities?.social_dancer == true
            })
            let photographers = all_users?.rows?.filter(dt => {
                let record = dt.toJSON()
                return record?.tango_activities?.photographer_at != null
            })

            let djs = all_users?.rows?.filter(dt => {
                let record = dt.toJSON()
                return record?.tango_activities?.dj_at != null
            })

            this.__collection = false;

            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                {
                    all_users,
                    teachers: {rows: teachers, count: teachers.length},
                    dancers: {rows: dancers, count: dancers.length},
                    photographers: {rows: photographers, count: photographers.length},
                    djs: {rows: djs, count: djs.length},
                    location: {
                        city: event?.city,
                        country: event?.country,
                        location: event?.location,
                        image_url: event.image_url
                    }
                }
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async mundoTangoDetails({request, response}) {
        try {
            this.request = request
            this.response = response

            let dancer_count = await TangoActivities.instance().orm.count({
                where: {
                    social_dancer: 1
                }
            })

            let events_count = await Event.instance().orm.count()
            let user_count = await this.modal.orm.count()
            let dancer_city_count = await this.modal.orm.findAndCountAll({
                where: {city: request.user.city},
                include: [
                    {
                        required: true,
                        model: TangoActivities.instance().getModel(),
                        as: 'tango_activities'
                    }
                ]
            })

            this.__collection = false;

            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                {
                    dancer_count,
                    events_count,
                    user_count,
                    dancer_city_count: dancer_city_count.count
                }
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async addMedia({request, response}) {
        try {
            this.request = request
            this.response = response

            const fileObject = this.request.files;
            if (!fileObject) return this.sendError(
                "media is required",
                {},
                400
            )

            let media_urls = []

            for (let file of fileObject) {
                const image = await FileHandler.doUpload(fileObject[0], getUploadDirectoryPath(UPLOAD_DIRECTORY.POST));
                const image_url = BASE_URL + UPLOAD_DIRECTORY.POST + "/" + image
                media_urls.push({mime_type: file?.mimetype, image_url: image_url})
            }

            this.__collection = false;

            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                media_urls
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async globalSearch({request, response}) {
        try {
            this.request = request
            this.response = response
            let {search, type} = request.query

            let peoples = []
            let events = []
            let groups = []
            let posts = []
            if (type == 'peoples' || !type) {
                peoples = await this.modal.orm.findAll({
                    where: {
                        username: {
                            [Op.like]: `%${search}%` // Adding `%` for partial matching
                        }
                    },
                    attributes: ['id', 'name', 'username', 'email', 'image_url'],
                    limit: 5
                });
            }

            if (type == "events" || !type) {
                events = await Event.instance().orm.findAll({
                    where: {
                        name: {
                            [Op.like]: `%${search}%` // Adding `%` for partial matching
                        }
                    },
                    limit: 5
                });
            }


            if (type == "groups" || !type) {
                groups = await Group.instance().orm.findAll({
                    where: {
                        name: {
                            [Op.like]: `%${search}%` // Adding `%` for partial matching
                        }
                    },
                    limit: 5
                });
            }


            if (type == "posts" || !type) {
                posts = await Post.instance().orm.findAll({
                    where: {
                        content: {
                            [Op.like]: `%${search}%` // Adding `%` for partial matching
                        }
                    },
                    include: Post.instance().includeAssociations(),
                    limit: 5
                });
            }


            this.__collection = false;

            this.__is_paginate = false
            return this.sendResponse(
                200,
                "Record fetched successfully",
                {
                    peoples,
                    events,
                    groups,
                    posts
                }
            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async updateFCMToken({request, response}) {
        try {
            this.request = request
            this.response = response
            this.__is_paginate = false
            this.__collection = false
            let updateToken = await UserApiToken.instance().updateFCMToken(request)
            return this.sendResponse(
                200,
                "Token updated successfully",
                {}
            );
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }

    async codeOfConduct({request, response}) {
        try {
            this.request = request
            this.response = response
            this.__is_paginate = false
            this.__collection = false
            await User.instance().updateUserFormStatus(13, request?.user?.id)
            return this.sendResponse(
                200,
                "Form status updated",

            );
        } catch (e) {
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                {},
                500
            )
        }
    }
}


module.exports = UserController;