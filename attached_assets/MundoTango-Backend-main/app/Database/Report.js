module.exports = (sequelize, Sequelize) => {
    const Report = sequelize.define("reports", {
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
        report_type_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./ReportType.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        instance_type: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['user', 'post', 'event', 'group'],
            defaultValue: 'user'
        },
        instance_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM(['resolved', 'unresolved']),
            defaultValue: 'unresolved'
        },
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return Report;
};
