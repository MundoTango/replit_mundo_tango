const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const HelpSupport = sequelize.define("help_supports", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        phone_number: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        query: {
            type: Sequelize.STRING(255),
            allowNull: true,
        }
    }, {
        timestamps: true,  // Automatically manages `createdAt` and `updatedAt`
        paranoid: true
    });

    return HelpSupport;
};
