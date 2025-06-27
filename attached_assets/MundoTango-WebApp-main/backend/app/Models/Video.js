const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');

const RestModel = require("./RestModel");
const { POST_TYPE_ENUM } = require("../config/enum");
const constants = require("../config/constants");
const User = require("./User");
const { Op, sequelize, QueryTypes, Sequelize } = require("../Database");
const LikePost = require("./LikePost");
const SavePost = require("./SavePost");
const StripePayment = require("./StripePayment");

class Video extends RestModel {

    constructor() {
        super("posts")
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
            'caption', 'sports_type', 'is_paid', 'price'
        ];
    }


    showColumns() {
        return [
            'slug', 'user_slug', 'type', 'is_shared', 'shared_post_slug', 'shared_post_caption', 'video_url', 'thumbnail_url',
            'caption', 'sports_type', 'is_paid', 'price', 'createdAt'
        ];
    }

    /**
     * omit fields from update request
     */
    exceptUpdateField() {
        return [];
    }

    /**
     * Hook for manipulate query of index result
     * @param {current mongo query} query
     * @param {adonis request object} request
     * @param {object} slug
     */
    async indexQueryHook(query, request, slug = {}) {
        const params = request.params;
        query.where = {
            ...query.where,
            user_slug: params.id,
            type: POST_TYPE_ENUM.VIDEO,
            is_shared: false
        }
    }


    async singleQueryHook(query, request, slug = {}) {
        query.where = {
            ...query.where,
            type: POST_TYPE_ENUM.VIDEO,
            is_shared: false
        }

        query.include = [
            {
                model: User.instance().getModel(),
                required: true,
                as: "Post_UserSlug",
                where: {
                    deletedAt: null
                }
            },
            {
                model: StripePayment.instance().getModel(),
                required: false,
                where: {
                    created_by: request.user.slug
                }
            }
        ]
    }

    /**
     * Hook for manipulate data input before add data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
        params.user_slug = request.user.slug;
        params.type = POST_TYPE_ENUM.VIDEO;
        params.is_shared = false;
        params.video_url = request.video_url;
        params.thumbnail_url = request.thumbnail_url;
        params.is_paid = (params.is_paid == '1') ? true : false;
        params.price = (params.is_paid == '1') ? (parseFloat(params.price) || 1) : null;
        params.is_activated = true
        params.createdAt = new Date();
    }


    async getHomeVideos(request) {
        const is_paid = request.query?.is_paid || false
        const sports_type = request.query?.sports_type
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        const conditions = {
            type: POST_TYPE_ENUM.VIDEO,
            ... (!_.isEmpty(sports_type) && { sports_type: sports_type }),
            is_shared: false,
            is_paid: is_paid,
            is_activated: true,
            deletedAt: null
        }

        const { count, rows } = await this.orm.findAndCountAll({
            where: conditions,
            limit: limit,
            offset: page * limit

        })

        request.query.total = count;
        return rows.map(item => item.toJSON())
    }

    async getSearchVideos(request) {
        const search = request.query?.search || ''
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        const { count, rows } = await this.orm.findAndCountAll({
            where: {
                type: POST_TYPE_ENUM.VIDEO,
                caption: { [Op.like]: `%${search}%` },
                is_shared: false,
                is_activated: true,
                deletedAt: null
            },
            include: [
                {
                    model: User.instance().getModel(),
                    required: true,
                    as: "Post_UserSlug",
                    where: {
                        deletedAt: null
                    }
                },
                {
                    model: LikePost.instance().getModel(),
                    required: false,
                    as: 'LikePost_PostSlug',
                    where: {
                        user_slug: request.user.slug,
                        deletedAt: null
                    }
                },
                {
                    model: SavePost.instance().getModel(),
                    required: false,
                    as: 'SavePost_PostSlug',
                    where: {
                        user_slug: request.user.slug,
                        deletedAt: null
                    }
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM like_posts AS lp
                            WHERE
                                lp.post_slug = posts.slug
                                AND
                                lp.deletedAt is null
                        )`),
                        'likes'
                    ],
                ]
            },
            limit: limit,
            offset: page * limit

        })

        request.query.total = count;
        return rows.map(item => item.toJSON())
    }

    async getFollowingVideos(request) {
        const user_slug = request.user.slug;
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        const { count, rows } = await this.orm.findAndCountAll({
            where: {
                user_slug: {
                    //     [Op.in]: Sequelize.literal(`(select f.followed_user_slug from follows f where f.user_slug="${user_slug}" and f.deletedAt is null)`),
                    [Op.ne]: user_slug
                },
                type: POST_TYPE_ENUM.VIDEO,
                is_activated: true,
                deletedAt: null
            },
            include: [
                {
                    model: this.getModel(),
                    required: false,
                    as: "Post_PostSlug",
                    where: {
                        deletedAt: null,
                        is_shared: false,
                        is_activated: true
                    },
                    include: {
                        model: User.instance().getModel(),
                        required: false,
                        as: "Post_UserSlug",
                        where: {
                            deletedAt: null
                        }
                    }
                },
                {
                    model: User.instance().getModel(),
                    required: true,
                    as: "Post_UserSlug",
                    where: {
                        deletedAt: null
                    }
                },
                {
                    model: LikePost.instance().getModel(),
                    required: false,
                    as: 'LikePost_PostSlug',
                    where: {
                        user_slug: request.user.slug,
                        deletedAt: null
                    }
                },
                {
                    model: SavePost.instance().getModel(),
                    required: false,
                    as: 'SavePost_PostSlug',
                    where: {
                        user_slug: request.user.slug,
                        deletedAt: null
                    }
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM like_posts AS lp
                            WHERE
                                lp.post_slug = posts.slug
                                AND
                                lp.deletedAt is null
                        )`),
                        'likes'
                    ],
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: page * limit

        })

        request.query.total = count;
        return rows.map(item => item.toJSON())
    }


    async getForYouVideos(request) {
        const page = _.isEmpty(request.query.page) ? 0 : parseInt(request.query.page) - 1;
        const limit = _.isEmpty(request.query.limit) ? constants.PAGINATION_LIMIT : parseInt(request.query.limit);

        const count = await this.orm.count({
            where: {
                is_activated: true,
                deletedAt: null
            }
        })

        request.query.total = count;

        const record = await sequelize.query(`
            select 
            x.slug as post_slug,x.thumbnail_url as post_thumbnail_url,x.is_paid as post_is_paid,x.price as post_price,x.likes,x.is_shared,x.shared_post_caption as shared_post_caption,x.createdAt,x.caption as shared_caption,
            x.user_slug,x.user_name,x.user_image,
            x.shared_post_slug as shared_post_slug,sp.thumbnail_url as shared_thumbnail_url,sp.caption as post_caption,sp.is_paid as shared_is_paid,sp.price as shared_price,
            sp.user_slug as owner_slug,owner.name as owner_name,owner.image_url as owner_image,
            lp.slug as is_liked,save_posts.slug as is_saved
            from (Select count(lp.slug) as likes, p.*,
            u.name as user_name ,u.image_url as user_image
            from posts p 
            inner join users u on u.slug = p.user_slug and u.deletedAt is null
            left join like_posts as lp on lp.post_slug = p.slug and lp.deletedAt is null
            where p.deletedAt is null and p.type=:type
            group by p.slug
            order by count(lp.slug) desc,p.createdAt desc
            limit :limit offset :offset) as x
            left join like_posts as lp on lp.user_slug=:user_slug and lp.post_slug=x.slug and lp.deletedAt is null
            left join save_posts as save_posts on save_posts.user_slug=:user_slug and save_posts.post_slug=x.slug and save_posts.deletedAt is null
            left join posts sp on sp.slug=x.shared_post_slug and x.is_shared=true and x.is_activated=true and sp.deletedAt is null
            left join users owner on owner.slug=sp.user_slug and owner.deletedAt is null
            ; `,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    type: POST_TYPE_ENUM.VIDEO,
                    user_slug: request.user.slug,
                    limit: limit,
                    offset: limit * page
                }
            })

        return _.isEmpty(record) ? [] : record
    }

    async shareVideo(request, post_slug, payload) {
        const params = {};
        params.slug = uuidv4();
        params.user_slug = request.user.slug;
        params.type = POST_TYPE_ENUM.VIDEO;
        params.is_shared = true;
        params.shared_post_slug = post_slug;
        params.shared_post_caption = payload?.caption
        params.createdAt = new Date();

        const record = await this.orm.create(params);

        return record.toJSON()

    }

    async getSimilarVideos(record) {
        const similar_videos = await this.orm.findAll({
            include: {
                model: LikePost.instance().getModel(),
                required: true,
                as: "LikePost_PostSlug"
            },
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('slug')), 'Like_Count']
                ]
            },
            group: ['posts.slug'],
            order: [[sequelize.literal('Like_Count'), 'DESC']],
            limit: 2,
            where: {
                sports_type: record?.sports_type,
                // slug: { $not: record?.slug || ""}
                slug: {
                    [Sequelize.Op.ne]: record?.slug || null
                }
            },
        });

        return similar_videos;
    }

    async getPaidPosts(user_slug) {

        return this.orm.findAll({
            include: {
                model: StripePayment.instance().getModel(),
                required: true,
                where: {
                    created_by: user_slug
                }
            },
        })
    }

}

module.exports = Video;