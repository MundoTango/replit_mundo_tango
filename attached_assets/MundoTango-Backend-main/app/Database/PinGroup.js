module.exports = (sequelize, Sequelize) => {
    const PinGroup = sequelize.define("pin_groups", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        group_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: require("./Group.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: require("./User.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return PinGroup;
};
