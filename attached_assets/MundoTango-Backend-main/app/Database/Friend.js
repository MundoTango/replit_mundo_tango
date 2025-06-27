module.exports = (sequelize, Sequelize) => {
    const Friend = sequelize.define("friends", {
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
            onUpdate: 'CASCADE'
        },
        friend_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./User.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        have_we_danced: {
            type: Sequelize.STRING(255),
            defaultValue: false,
        },
        city_we_meet: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        when_did_we_meet: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        event_we_meet: {
            type: Sequelize.STRING(255),
            allowNull: true,
        },
        connect_reason: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        sender_notes: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        receiver_notes: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['pending', 'decline', 'connected'],
            defaultValue: 'pending'
        }
    }, {
        timestamps: true,  // Automatically manages `createdAt` and `updatedAt`
        paranoid: true
    });

    return Friend;
};
