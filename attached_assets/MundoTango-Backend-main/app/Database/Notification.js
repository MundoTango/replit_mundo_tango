module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define("notifications", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./User.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        sender_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./User.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        type: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        instance_id: {
            type: Sequelize.INTEGER,
            defaultValue: 0
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
            allowNull: true,
        },
        is_read: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,
    });

    return Notification;
};
