module.exports = (sequelize, Sequelize) => {
    const Tour_Operator_Experience = sequelize.define("tour_operator_experience", {
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
        cities: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        website_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        theme: {
            type: Sequelize.TEXT,
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

    return Tour_Operator_Experience;
}
