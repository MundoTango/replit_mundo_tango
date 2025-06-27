module.exports = (sequelize, Sequelize) => {
    const UserSubscription = sequelize.define("user_subscriptions", {
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
        },
        subscription_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./Subscription.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        expiry_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['active', 'expired', 'cancelled'],
            defaultValue: 'active'
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return UserSubscription;
};
