module.exports = (sequelize, Sequelize) => {
    const EventType = sequelize.define("event_types", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        }
    }, {
        timestamps: true,  // Automatically adds `createdAt` and `updatedAt`
        paranoid: true
    });

    return EventType;
};
