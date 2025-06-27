const RestModel = require("./RestModel");
const _ = require("lodash")
const { v4: uuidv4 } = require('uuid');
const PushNotification = require("../Libraries/PushNotification/Index.js");
const UserApiToken = require("./UserApiToken");
const { sequelize, QueryTypes } = require("../Database");

class Notification extends RestModel {
    constructor() {
        super("notifications")
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
            'type', 'device_token', 'apiToken_id', 'title', 'message', 'badge', 'mutable_content', 'content_available', 'image_url', 'payload', 'is_read'
        ];
    }


    showColumns() {
        return [
            'id', 'slug', 'type', 'device_token', 'apiToken_id', 'title', 'message', 'badge', 'mutable_content', 'content_available', 'image_url', 'payload', 'is_read'
        ];
    }

    /**
     * omit fields from update request
     */
    exceptUpdateField() {
        return [];
    }

    async beforeCreateHook(request, params) {
        params.slug = uuidv4();
    }

    async afterCreateHook(record, request, params) {
        console.log("Notification Payload : ",
            record.device_token,
            record.title,
            record.message,
            record.payload,
            record.badge,
            record.mutable_content,
            record.content_available,
            record.image_url)
        try {
            if (request?.IS_BLOCKED_NOTIFICATION) return;
            await PushNotification.instance().sendPush(
                record.device_token,
                record.title,
                record.message,
                record.payload,
                record.badge,
                record.mutable_content,
                record.content_available,
                record.image_url
            )
        }
        catch (err) {
            console.log('Error in sending notification : ', err)
        }

    }


    async getNotificationCount(user_slug) {
        const record = await this.orm.count({
            where: {
                is_read: false,
            },
            include: {
                model: UserApiToken.instance().getModel(),
                as: "Notification_ApiTokenID",
                required: true,
                where: {
                    slug: user_slug
                }
            }
        })

        return record;
    }

    async resetNotificationCount(user_slug) {
        const query = `
        update notifications
        inner join user_api_tokens as uat on uat.id = apiToken_id
        set is_read=true
        where uat.slug = '${user_slug}'
        `

        await sequelize.query(query, { type: QueryTypes.UPDATE });
        return true;
    }

}

module.exports = Notification




