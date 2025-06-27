const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const Activity = sequelize.define("activities", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        parent_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'activities', // Self-referencing foreign key
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        icon_url: {
            type: Sequelize.STRING(255),
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('icon_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        }
    }, {
        timestamps: true, // Automatically handles `createdAt` and `updatedAt`
        paranoid: true
    });

    return Activity;
};
