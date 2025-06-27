module.exports = (sequelize, Sequelize) => {
    const Performer_Experience = sequelize.define("performer_experience", {
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
        partner_profile_link: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        recent_performance_url: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Performer_Experience;
}
