const _ = require("lodash")
const {v4: uuidv4} = require('uuid');

const RestModel = require("./RestModel")
const Subscription = require("./Subscription");
const User = require("./User");
const WebhookLog = require("./WebhookLog");
const {SUBSCRIPTION_STATUS} = require("../config/enum");
const StripeHandler = require("../Libraries/StripeHandler/stripe");
const {Op,fn} = require("sequelize");

class UserSubscription extends RestModel {

    constructor() {
        super("user_subscriptions")
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
        return ['id', 'user_id', 'subscription_id', 'amount', 'expiry_date', 'status'];
    }


    showColumns() {
        return ['id', 'user_id', 'subscription_id', 'amount', 'expiry_date', 'status'];
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
        query.include = [
            {
                model: User.instance().getModel(),
                attributes: ['id', 'name', 'email', 'image_url']
            }
        ]
    }

    /**
     * Hook for manipulate data input before add data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     */
    async beforeCreateHook(request, params) {
        // await this.deleteRecord(params?.platform_id)
        params.createdAt = new Date();
    }

    /**
     * Hook for execute command after add public static function called
     * @param {saved record object} record
     * @param {controller request object} request
     * @param {payload object} params
     */
    async afterCreateHook(record, request, params) {
    }


    /**
     * Hook for manipulate data input before update data is execute
     * @param {adonis request object} request
     * @param {payload object} params
     * @param {string} slug
     */
    async beforeEditHook(request, params, slug) {
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            },
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async findRecordByCondition(query) {
        const record = await this.orm.findOne({
            where: query,
            include: [
                {
                    model: Subscription.instance().getModel()
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }


    async findOrCreateRecord(request, params) {
        let user;
        user = (await this.orm.findOne({
            where: {
                email: params.email,
                platform_id: params.platform_id,
                platform_type: params.platform_type,
                deletedAt: null
            }
        }))?.toJSON()

        if (_.isEmpty(user)) {
            user = await this.createRecord(request, params)
        }

        return user;
    }

    async createRecord(request, params) {
        let data = await this.orm.create(params)
        return data;
    }


    async getUserRecord(platform_id, platform_type) {
        const record = await this.orm.findOne({
            where: {
                platform_id,
                platform_type,
                deletedAt: null
            },
            order: [['createdAt', 'desc']],
        })

        return _.isEmpty(record) ? {} : record.toJSON()

    }


    async deleteRecord(platform_id) {
        console.log("Delete User Record By Platform ID ", platform_id)
        const query = await this.orm.destroy({
            where: {
                platform_id: platform_id
            }
        })
        return true;

    }


    async handleWebhook(request){
        let input = request?.body;
        await WebhookLog.instance().createRecord(request,{
            data: JSON.stringify(input)
        });

        switch (input?.type) {
            case "invoice.payment_succeeded":
                let user = await User.instance().getRecordByCondition(request,{
                    stripe_customer_id: input?.data?.object?.customer
                });
                let stripe_subscription = await StripeHandler.getSubscription(input?.data?.object?.subscription)
                let subscription = await Subscription.instance().getRecordByCondition(request,{
                    stripe_price_id: input?.data?.object?.lines?.data?.[0]?.plan?.id
                })
                if (user && subscription && stripe_subscription && stripe_subscription.status == "active"){
                    /* mark complete all previous active subscriptions */
                    await this.orm.update({
                        status:SUBSCRIPTION_STATUS.COMPLETED
                    }, {
                        where: {
                            user_id: user.id,
                            status: SUBSCRIPTION_STATUS.ACTIVE
                        }});
                    /* create new active subscription */
                    await this.createRecord(request,{
                        user_id: user.id,
                        subscription_id: subscription.id,
                        expire_at: new Date(stripe_subscription?.current_period_end * 1000),
                        price: input?.data?.object?.amount_paid / 100,
                        gateway_transaction_id: stripe_subscription?.id,
                        status: SUBSCRIPTION_STATUS.ACTIVE
                    })
                }
                break;
            case "customer.subscription.deleted":
                await this.orm.update({
                    status: SUBSCRIPTION_STATUS.CANCELLED_IMMEDIATELY
                },{
                    gateway_transaction_id: input?.data?.object?.id,
                    status: SUBSCRIPTION_STATUS.ACTIVE
                });
                break;
            case "customer.subscription.updated":
                break;
        }
    }

    async cancelSubscription(request){
        let subscription = await this.getRecordByCondition(request,{
            id: request?.body?.subscription_id,
            status: SUBSCRIPTION_STATUS.ACTIVE
        });
        if (!subscription){
            throw new Error("You don't have any active subscription")
        }
        await StripeHandler.cancelSubscription(subscription?.gateway_transaction_id)
        return true;
    }
    async getActiveSubscription(request){
        let subscription = await this.getRecordByCondition(request,{
            user_id: request?.user?.id,
            status: SUBSCRIPTION_STATUS.ACTIVE,
            expire_at: {
                [Op.gte]: fn('NOW')
            }
        });
        return subscription;
    }

}

module.exports = UserSubscription;