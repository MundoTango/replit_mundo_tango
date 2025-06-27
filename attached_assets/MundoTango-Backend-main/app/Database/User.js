const { LOGIN_TYPE } = require("../config/enum.js");
const {BASE_URL} = require("../config/constants");
const {getImageUrl} = require("../Helper");

module.exports = (sequelize, Sequelize) => {

    const User = sequelize.define("users", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_type: {
            type: Sequelize.STRING(50),
            allowNull: false,
            references: {
                model: require("./UserGroups.js")(sequelize, Sequelize),
                key: 'type'
            },
        },
        name: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        username: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        firstname: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        lastname: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        facebook_url: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: true,
        },
        mobile_no: {
            type: Sequelize.STRING(15),
            allowNull: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        location: {
            type: Sequelize.GEOMETRY,
            allowNull: true,
        },
        city: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        country: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        slug: {
            type: Sequelize.STRING(100),
            allowNull: true,
            unique: true
        },
        latitude: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        longitude: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        bio: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        image_url: {
            type: Sequelize.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('image_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return "https://api.mundotango.trangotechdevs.com/user/user-placeholder.jpeg"
            }
        },
        background_url: {
            type: Sequelize.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('background_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        is_email_verify: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,

        },
        is_profile_completed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        is_guideline: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        form_status: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        email_verifyAt: {
            type: Sequelize.DATE,
            allowNull: true
        },
        is_mobile_verify: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,

        },
        mobile_verifyAt: {
            type: Sequelize.DATE,
            allowNull: true
        },
        login_type: {
            type: Sequelize.STRING(30),
            defaultValue: LOGIN_TYPE.CUSTOM,
            allowNull: true,
        },
        platform_type: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        platform_id: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        is_activated: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        is_blocked: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        is_pushNotification: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        is_privacy: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },
        deletedAt: {
            type: Sequelize.DATE,
            allowNull: true
        }
    });

    return User;
}
