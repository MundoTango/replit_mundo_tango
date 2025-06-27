module.exports = (sequelize, Sequelize) => {
    const Host_Experience = sequelize.define("host_experience", {
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
        property_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        city: {
            type: Sequelize.STRING,
            allowNull: true
        },
        space: {
            type: Sequelize.STRING,
            allowNull: true
        },
        people: {
            type: Sequelize.INTEGER,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Host_Experience;
}
