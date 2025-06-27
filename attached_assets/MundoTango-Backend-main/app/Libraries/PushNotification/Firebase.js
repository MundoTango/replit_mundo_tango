'use strict'
const admin = require("firebase-admin");
const constants = require("../../config/constants");
const { isJSON } = require("../../Helper");

admin.initializeApp({
    credential: admin.credential.cert(constants.SERVICE_ACCOUNT),
});

class Firebase {
    async sendPush(token, title, message, payload, badge, mutableContent, contentAvailable, image_url = '') {
        try {
            var notification_payload = {
                data: {
                    title: title,
                    body: message,
                },
                notification: {
                    title: title,
                    body: message,
                },
                apns: {
                    payload: {
                        aps: {
                            badge: badge,
                            mutableContent: mutableContent,
                            "content-available": contentAvailable
                        },
                    },
                    // fcm_options: {
                    //     image: imageUrl
                    // }
                },
                webpush: {
                    // headers: {
                    //     image: imageUrl
                    // }
                },
                token: token
            };

            console.log(notification_payload)
            return await admin
                .messaging()
                .send(notification_payload)
        } catch (e) {
            console.log(e)
        }

    }
}
module.exports = Firebase;
