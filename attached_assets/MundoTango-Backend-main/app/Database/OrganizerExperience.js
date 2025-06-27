module.exports = (sequelize, Sequelize) => {
    const Organizer_Experience = sequelize.define("organizer_experience", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: require("./User.js")(sequelize, Sequelize),
                key: 'id'
            }
        },
        hosted_events: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        hosted_event_types: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        cities: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Organizer_Experience;
}
