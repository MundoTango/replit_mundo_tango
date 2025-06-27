module.exports = (sequelize, Sequelize) => {
    const Dance_Experience = sequelize.define("dance_experience", {
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
        social_dancing_cities: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        recent_workshop_cities: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        favourite_dancing_cities: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        annual_event_count: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Dance_Experience;
}
