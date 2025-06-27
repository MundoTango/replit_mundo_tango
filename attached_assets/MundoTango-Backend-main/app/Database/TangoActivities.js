module.exports = (sequelize, Sequelize) => {
    const Tango_Activities = sequelize.define("tango_activities", {
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
        teacher_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        dj_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        photographer_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        host_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        organizer_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        creator_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        performer_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        tour_operator_at: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        other: {
            type: Sequelize.TEXT
        },
        social_dancer: {
            type: Sequelize.BOOLEAN
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Tango_Activities;
}