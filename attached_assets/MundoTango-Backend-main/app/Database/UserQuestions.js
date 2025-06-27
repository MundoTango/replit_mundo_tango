module.exports = (sequelize, Sequelize) => {

    const User_Questions = sequelize.define("user_questions", {
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
        city: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        start_dancing: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        guide_visitors: {
            type: Sequelize.BOOLEAN
        },
        is_nomad: {
            type: Sequelize.BOOLEAN
        },
        lived_for_tango: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        languages: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        website_url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        dance_role_leader : {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        dance_role_follower  : {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        about   : {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        deletedAt: {
            type: Sequelize.DATE,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return User_Questions;
}