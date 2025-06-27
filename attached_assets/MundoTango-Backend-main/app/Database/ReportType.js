module.exports = (sequelize, Sequelize) => {
    const ReportType = sequelize.define("report_types", {
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
                model: 'report_types',
                key: 'id',
            },
        },
        name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return ReportType;
};
