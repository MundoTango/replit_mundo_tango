module.exports = (sequelize, Sequelize) => {
    const Subscription = sequelize.define("subscriptions", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        stripe_price_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0.00,
        },
        duration: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'in months',
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive'],
            defaultValue: 'active'
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return Subscription;
};
