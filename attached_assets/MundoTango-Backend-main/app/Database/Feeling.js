const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const Feeling = sequelize.define("feelings", {
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
        icon_url: {
            type: Sequelize.STRING(255),
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('icon_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        }
    }, {
        timestamps: true,  // Automatically manages `createdAt` and `updatedAt`
        paranoid: true
    });

    return Feeling;
};
