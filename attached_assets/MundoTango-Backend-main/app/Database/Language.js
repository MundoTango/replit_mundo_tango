module.exports = (sequelize, Sequelize) => {
    const Language = sequelize.define("languages", {
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
        code: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        country: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        isRTL: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        }
    }, {
        timestamps: true,  // Automatically adds `createdAt` and `updatedAt`
        paranoid: true
    });

    return Language;
};
