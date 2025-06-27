module.exports = (sequelize, Sequelize) => {
    const Photographer_Experience = sequelize.define("photographer_experience", {
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
        role: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['photographer', 'videographer', 'both'],
            defaultValue: 'photographer'
        },
        facebook_profile_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        videos_taken_count: {
            type: Sequelize.INTEGER,
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

    return Photographer_Experience;
}
