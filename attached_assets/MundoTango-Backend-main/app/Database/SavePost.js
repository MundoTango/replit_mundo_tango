module.exports = (sequelize, Sequelize) => {
    const SavePost = sequelize.define("save_posts", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        post_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: require("./Post.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: require("./User.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return SavePost;
};
