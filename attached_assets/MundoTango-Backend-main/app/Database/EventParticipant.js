module.exports = (sequelize, Sequelize) => {
    const EventParticipant = sequelize.define("event_participants", {
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
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./User.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        user_type: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['co-host', 'host', 'teacher', 'dj', 'photographer', 'musician', 'general', 'admin'],
            defaultValue: 'co-host'
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['interested', 'going', 'invited'],
            defaultValue: 'going'
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true
    });

    return EventParticipant;
};
