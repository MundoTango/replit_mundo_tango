const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const Group = sequelize.define("groups", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        group_type: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['public', 'private', 'city-group', 'normal-group', 'privacy', 'friend'],
            defaultValue: 'public'
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        image_url: {
            type: Sequelize.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('image_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        },
        location: {
            type: Sequelize.GEOMETRY,
            allowNull: true,
        },
        city: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        country: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        latitude: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        longitude: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        address: {
            type: Sequelize.TEXT('long'),
            allowNull: true
        },
        privacy: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['public', 'privacy', 'friends'],
            defaultValue: 'public'
        },
        number_of_participants: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['active', 'inactive'],
            defaultValue: 'active'
        },
        total_followers: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return Group;
};
