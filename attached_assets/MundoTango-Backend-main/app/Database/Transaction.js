module.exports = (sequelize, Sequelize) => {
    const Transaction = sequelize.define("transactions", {
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
        gateway_transaction_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        transaction_amount: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0.00,
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'debit, credit',
        },
        currency: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return Transaction;
};
