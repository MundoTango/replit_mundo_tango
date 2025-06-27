const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const Event = sequelize.define("events", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./User.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        event_type_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./EventType.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        city_group_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: require("./Group.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        image_url: {
            type: Sequelize.STRING(255),
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('image_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        },
        start_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        end_date: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        location: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        city: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        country: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        latitude: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        longitude: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        visibility: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['public', 'private', 'friends'],
            defaultValue: 'public'
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        about_space: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['active', 'inactive'],
            defaultValue: 'active'
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true
    });

    return Event;
};
