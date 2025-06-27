'use strict'


const stripe = require('stripe')(process.env.STRIPE_SECRET);

class StripeHandler {

    static async addCustomer(email){
        return stripe.customers.create({
            email: email
        });
    }
    static async attachPaymentMethodWithCustomer(payment_method_id,customer_id){
        return stripe.paymentMethods.attach(
            payment_method_id,
            {
                customer: customer_id,
            }
        );
    }
    static async detachPaymentMethodWithCustomer(payment_method_id){
        return stripe.paymentMethods.detach(
            payment_method_id
        );
    }
    static async retrievePaymentMethod(payment_method_id){
        return stripe.paymentMethods.retrieve(
            payment_method_id
        );
    }

    static async createPaymentIntent(customer_id, payment_method_id, amount) {
        return stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            payment_method_types: ['card'],
            payment_method: payment_method_id,
            customer: customer_id
        });
    }

    static async confirmPaymentIntent(payment_intent, payment_method_id) {
        return stripe.paymentIntents.confirm(
            payment_intent,
            {payment_method: payment_method_id}
        );
    }

    static async chargeCard(customer_id, payment_method_id, amount) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            payment_method_types: ['card'],
            payment_method: payment_method_id,
            customer: customer_id
        });
        return stripe.paymentIntents.confirm(
            paymentIntent.id,
            {payment_method: payment_method_id}
        );
    }
    static async chargeThroughConnectedAccount(connected_account_id, amount) {
        return stripe.charges.create({
            amount: Math.round(amount * 100),
            currency: "usd",
            source: connected_account_id
        });

    }

    static async createAccountLink(user_slug,stripe_connect_account_id) {
        let account;
        if (!stripe_connect_account_id){
            account = await stripe.accounts.create({
                type: 'express'
            });
        }
        let accountId  = stripe_connect_account_id ? stripe_connect_account_id : account.id;
        const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: process.env.BASE_URL + 'web/return-connect-account-failure' + "?user_slug=" + user_slug,
                return_url: process.env.BASE_URL + 'web/return-connect-account' + "?user_slug=" + user_slug +
                    "&account_id=" + accountId,
                type:
                    'account_onboarding',
            })
        ;
        return {account_link: accountLink}
    }

    static async getAccountInfo(account_id) {
        return stripe.accounts.retrieve(
            account_id
        );
    }

    static async payout(amount, connect_account_id) {
        return stripe.transfers.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            destination: connect_account_id
        });
    }

    static async refund(amount, payment_intent) {
        return stripe.refunds.create({
            amount: Math.round(amount * 100),
            payment_intent: payment_intent,
        });
    }

    static async getBalance() {
        return stripe.balance.retrieve();
    }

    static async getSubscription(subscription_id){
        const subscription = await stripe.subscriptions.retrieve(
            subscription_id
        );
        return subscription;
    }
    static async cancelSubscription(subscription_id){
        const subscription = await stripe.subscriptions.cancel(
            subscription_id
        );
        return subscription;
    }

}
module.exports = StripeHandler
