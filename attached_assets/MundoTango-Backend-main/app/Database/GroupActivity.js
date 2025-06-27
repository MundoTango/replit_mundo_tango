module.exports = (sequelize, Sequelize) => {
    const GroupActivity = sequelize.define("group_activities", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        group_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./Group.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        non_tango_activity_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./NonTangoActivity.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return GroupActivity;
};
