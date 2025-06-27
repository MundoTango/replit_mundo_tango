module.exports = (sequelize, Sequelize) => {
    const UserTravel = sequelize.define("user_travels", {
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
        event_type_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: require("./EventType.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
        },
        event_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        start_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        end_date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['active', 'inactive'],
            defaultValue: 'active'
        },

    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return UserTravel;
};
