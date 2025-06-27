module.exports = (sequelize, Sequelize) => {
    const AdminQuery = sequelize.define("admin_queries", {
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
        email: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        phone: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        }
    }, {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt`
        paranoid: true
    });

    return AdminQuery;
};
