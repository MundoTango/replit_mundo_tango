module.exports = (sequelize, Sequelize) => {
    const Page = sequelize.define("pages", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        slug: {
            type: Sequelize.STRING(100),
            allowNull: false,
            unique: true,
        },
        url: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        title: {
            type: Sequelize.STRING(200),
            allowNull: false,
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true
    });

    return Page;
};
