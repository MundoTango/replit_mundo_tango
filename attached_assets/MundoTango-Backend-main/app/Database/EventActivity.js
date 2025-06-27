module.exports = (sequelize, Sequelize) => {
    const EventActivity = sequelize.define("event_activities", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        event_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./Event.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        non_tango_activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./NonTangoActivity.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true
    });

    return EventActivity;
};
