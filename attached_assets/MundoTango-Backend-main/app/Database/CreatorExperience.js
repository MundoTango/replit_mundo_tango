module.exports = (sequelize, Sequelize) => {
    const Creator_Experience = sequelize.define("creator_experience", {
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
        shoes_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        clothing_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        jewelry: {
            type: Sequelize.STRING,
            allowNull: true
        },
        vendor_activities: {
            type: Sequelize.STRING,
            allowNull: true
        },
        vendor_url: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Creator_Experience;
}
