const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const NonTangoActivity = sequelize.define("non_tango_activities", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        icon_url: {
            type: Sequelize.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('icon_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return NonTangoActivity;
};
