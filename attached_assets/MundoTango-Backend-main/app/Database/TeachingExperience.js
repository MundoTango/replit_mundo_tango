module.exports = (sequelize, Sequelize) => {
    const Teaching_Experience = sequelize.define("teaching_experience", {
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
        partner_facebook_url: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        cities: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        online_platforms : {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        about_tango_future: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        teaching_reason: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        preferred_size: {
            type: Sequelize.INTEGER,
            allowNull: true,
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Teaching_Experience;
}