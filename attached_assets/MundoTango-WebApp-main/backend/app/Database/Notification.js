
module.exports = (sequelize, Sequelize) => {

    const Notification = sequelize.define("notifications", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        slug: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true
        },
        type: {
            type: Sequelize.STRING(30),
            allowNull: false,
        },
        apiToken_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            onDelete: 'CASCADE',
            onUpdate: 'NO ACTION',
            references: {
                model: require("./UserApiTokens")(sequelize, Sequelize),
                key: 'id',
            }
        },
        device_token: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        title: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        message: {
            type: Sequelize.STRING(300),
            allowNull: false,
        },
        badge: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        mutable_content: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        content_available: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        image_url: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        payload: {
            type: Sequelize.TEXT,
            allowNull: false,
            get: function () {
                return this.getDataValue("payload");
            },
            set: function (value) {
                return this.setDataValue("payload", JSON.stringify(value));
            }
        },
        is_read: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        deletedAt: {
            type: Sequelize.DATE,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
    });

    return Notification;
}