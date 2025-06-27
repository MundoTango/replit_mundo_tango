const { USER_UPLOAD_DIRECTORY } = require("./constants")

const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
}


const UPLOAD_DIRECTORY = {
    USER: "user",
    POST: "post"
}

const UPLOAD_DIRECTORY_MAPPING = {
    [UPLOAD_DIRECTORY.USER]: 'user',
}

const LOGIN_TYPE = {
    CUSTOM: "custom",
    GOOGLE: "google",
    APPLE: 'apple',
    FACEBOOK: 'facebook'
}

const API_TOKENS_ENUM = {
    ACCESS: "ACCESS",
    RESET: 'RESET'
}

const OTP_VERIFICATION_TYPE = {
    EMAIL: 'EMAIL',
    MOBILE_NO: 'MOBILE_NO'
}


const SETTING_ENUM = {
    PRIVACY_POLICY: 'privacy-policy',
    TERMS_AND_CONDITION: 'terms-and-condition'
}

const SETTING_MAPPING_ENUM = {
    'privacy-policy': SETTING_ENUM.PRIVACY_POLICY,
    'terms-and-condition': SETTING_ENUM.TERMS_AND_CONDITION,
}

const CHAT_ROOM_STATUS_ENUM = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
}

const MESSAGE_TYPE_ENUM = {
    TEXT: 'TEXT',
    FILE: 'FILE',
    BADGE: 'BADGE'
}
const CHAT_ROOM_TYPE_ENUM = {
    SINGLE: 'single',
    GROUP: 'group'
}

const SUBSCRIPTION_STATUS = {
    ACTIVE: 10,
    EXPIRED: 20,
    CANCELLED: 30,
    CANCELLED_IMMEDIATELY: 31,
    PAUSED: 40,
    COMPLETED: 50
}
module.exports = {
    ROLES,
    LOGIN_TYPE,
    API_TOKENS_ENUM,
    OTP_VERIFICATION_TYPE,
    UPLOAD_DIRECTORY,
    UPLOAD_DIRECTORY_MAPPING,
    SETTING_ENUM,
    SETTING_MAPPING_ENUM,
    CHAT_ROOM_STATUS_ENUM,
    MESSAGE_TYPE_ENUM,
    SUBSCRIPTION_STATUS,
    CHAT_ROOM_TYPE_ENUM
}