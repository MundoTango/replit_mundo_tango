const _ = require("lodash")

const RestController = require("../../RestController");
const {SETTING_MAPPING_ENUM, UPLOAD_DIRECTORY, SUBSCRIPTION_STATUS} = require("../../../config/enum");
const {validateAll, getUploadDirectoryPath, validateAsync} = require("../../../Helper");
const User = require('../../../Models/User')
const FileHandler = require("../../../Libraries/FileHandler/FileHandler");
const UserSubscription = require("../../../Models/UserSubscription");
const {Sequelize} = require("sequelize");
const StripeHandler = require("../../../Libraries/StripeHandler/stripe");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

class SubscriptionController extends RestController {

    constructor() {
        super('Subscription')
        this.resource = 'Subscription';
        // this.__collection = false
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
                    name: "required",
                    stripe_price_id: 'required',
                    amount: 'required',
                    duration: 'required',
                }
                validator = await validateAll(this.request.body, rules, customMessages)
                break;
        }
        return validator;
    }

    async sessionCheckout({request, response}) {
        try {

            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let subscription = await this.modal.findRecordById(request.body.subscription_id)

            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: subscription?.stripe_price_id,
                        quantity: 1,
                    },
                ],
                success_url: 'https://web.mundotango.life/',
                cancel_url: 'https://web.mundotango.life/',
            });

            let currentDate = new Date()

            await UserSubscription.instance().createRecord(request, {
                user_id: request?.user?.id,
                subscription_id: subscription?.id,
                amount: subscription?.amount,
                expiry_date: currentDate.setMonth(currentDate.getMonth() + subscription?.duration),
                status: 'active'
            })

            return await this.sendResponse(
                200,
                "Subscription plan subscribed successfully",
                session
            )
        } catch (e) {
            console.log(e?.message)
            console.log(e)
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async getIsPlanSubscribed({request, response}) {
        try {

            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            let data = await UserSubscription.instance().findRecordByCondition({
                user_id: request?.user?.id,
                status: 'active'
            })

            if (_.isEmpty(data)) {
                return await this.sendResponse(
                    200,
                    "No subscription plan subscribed.",
                    {}
                )
            }

            const currentDate = new Date();
            const expiryDate = new Date(data.expiry_date);
            const differenceInMillis = expiryDate - currentDate;
            const remainingDays = Math.ceil(differenceInMillis / (1000 * 60 * 60 * 24));


            return await this.sendResponse(
                200,
                "Subscribed plan fetched successfully",
                {
                    ...data,
                    remaining_days: remainingDays
                }
            )
        } catch (e) {

            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }

    async subscriptionStatusActive({request, response}) {
        try {
            this.request = request
            this.response = response

            this.__collection = false
            this.__is_paginate = false

            await this.modal.orm.update({
                status: Sequelize.literal('case when status="active" then "inactive" else "active" end')
            }, {
                where: {
                    id: request.params.id
                }
            })

            return await this.sendResponse(
                200,
                "Subscription status updated",
                {}
            )
        } catch (e) {
            return this.sendError(
                "Internal server error. Please try again later.",
                e?.message,
                500
            )
        }
    }
}


module.exports = SubscriptionController