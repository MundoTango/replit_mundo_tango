const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const Faqs = sequelize.define("faqs", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        question: {
            type: Sequelize.TEXT('long'),
            allowNull: false,
        },
        answer: {
            type: Sequelize.TEXT('long'),
            allowNull: false,
        }
    }, {
        timestamps: true,
        paranoid: true
    });

    return Faqs;
};
