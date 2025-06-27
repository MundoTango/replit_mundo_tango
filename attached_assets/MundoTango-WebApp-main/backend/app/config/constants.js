module.exports = {
    PASSWORD_SALT_ROUND: 6,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    CLIENT_ID: process.env.CLIENT_ID,
    BASE_URL: process.env.BASE_URL,
    FILE_SYSTEM: process.env.FILE_SYSTEM,

    MAIL_SYSTEM: process.env.MAIL_SYSTEM,
    MAIL_API_KEY: process.env.MAIL_API_KEY,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_EMAIL: process.env.MAIL_EMAIL,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_FROM: process.env.MAIL_FROM,
    EMAIL_VERIFICATION: 1,
    SMS_VERIFICATION: 0,

    TRAINING_EXPIRY_TIME: 5000,

    PAGINATION_LIMIT: 20,
}