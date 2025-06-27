const _ = require("lodash");
const {v4: uuidv4} = require("uuid");
const RestModel = require("./RestModel");
const TangoActivities = require("./TangoActivities")
const Firebase = require("../Libraries/PushNotification/Firebase");
const UserApiToken = require("./UserApiToken");
const {Op} = require("sequelize");

class Notification extends RestModel {
    constructor() {
        super("notifications");
    }

    getFields = () => {
        return [
            'id', 'slug', 'url', 'title', 'content', 'createdAt', 'updatedAt'
        ];
    }

    showColumns = () => {
        return [
            'id', 'slug', 'url', 'title', 'content', 'createdAt', 'updatedAt'
        ];
    }

    exceptUpdateField = () => {
        return ['id'];
    }

    async findRecordById(id) {
        const record = await this.orm.findOne({
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async getRecordByCondition(query) {
        const record = await this.orm.findAll({
            where: query
        })

        return _.isEmpty(record) ? null : record.map(dt => dt.toJSON());
    }

    async readAllNotification(user_id) {
        const record = await this.orm.update({is_read: 1}, {
            where: {
                user_id: user_id
            }
        })

        return _.isEmpty(record) ? null : record;
    }

    async readNotificationById(id) {
        const record = await this.orm.update({is_read: 1}, {
            where: {
                id: id
            }
        })

        return _.isEmpty(record) ? null : record;
    }

    async getContentBySlug(slug) {
        const record = await this.orm.findOne({
            where: {
                slug: slug
            }
        })

        return _.isEmpty(record) ? null : record.toJSON();
    }

    async createRecord(request, params) {
        let data = await this.orm.create(params)
        return data;
    }

    async sendNotification(request, sender_id, receiver_id, type, title, message, image_url, instance_id) {
        let payload = {
            user_id: receiver_id,
            sender_id: sender_id,
            type: type,
            title: title,
            message: message,
            image_url: image_url,
            instance_id: instance_id
        }
        let user = await UserApiToken.instance().getRecordByCondition(request, {user_id: receiver_id, deletedAt: null})
        console.log(receiver_id, user, "user")
        let push_message = new Firebase()
        push_message.sendPush(user?.device_token, title, message, payload, 1, 1, 1)
        await this.orm.create(payload)

    }

    async testNotification(request) {
        let push_message = new Firebase()
        return push_message.sendPush(request?.body?.device_token, request?.body?.title, request?.body?.message, {}, 1, 1, 1)
    }
    async beforeCreateHook(request, params) {
        params.text = params.text?.trim()
        params.createdAt = new Date()
    }

    async beforeEditHook(request, params, slug) {
        let exceptUpdateField = this.exceptUpdateField();
        exceptUpdateField.filter(exceptField => {
            delete params[exceptField];
        });
    }

    async sendNotificationToAllUsers(request) {
        let user_token = await UserApiToken.instance().getRecordsByCondition(request, {
            deletedAt: null
        })
        let notifications = []

        let notification = new Firebase()
        let device_token = user_token.map(dt => {
            notifications.push({
                user_id: dt?.user_id,
                sender_id: request.user.id,
                type: "admin",
                title: request.body?.title,
                message: request.body?.message,
                instance_id: request.user.id
            })
            notification.sendPush(dt.device_token, request.body?.title, request.body?.message, null, 1, 1, 1, "").then(res => {
                console.log("notification sent successfully")
            }).catch(err => {
                console.log("notification Err", err)
            })
        })

        await this.orm.bulkCreate(notifications)


    }

    async sendNotificationToSpecificUsers(request) {
        console.log(request.body.user_ids, "request.body.user_ids")
        let user_token = await UserApiToken.instance().getRecordsByCondition(request, {
            user_id: {[Op.in]: request.body.user_ids}
        })

        let notifications = []

        let notification = new Firebase()
        let device_token = user_token.map(dt => {
            notifications.push({
                user_id: dt?.user_id,
                sender_id: request.user.id,
                type: "admin",
                title: request.body?.title,
                message: request.body?.message,
                instance_id: request.user.id
            })
            notification.sendPush(dt?.device_token, request.body?.title, request.body?.message, null, 1,1, 1, "").then(res => {
                console.log("notification sent successfully", res)
            }).catch(err => {
                console.log("notification Err", err)
            })
        })

        await this.orm.bulkCreate(notifications)

    }
}

module.exports = Notification;
