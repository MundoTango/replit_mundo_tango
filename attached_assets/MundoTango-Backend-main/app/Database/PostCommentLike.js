
module.exports = (sequelize, Sequelize) => {
    const PostCommentLikes = sequelize.define("post_comment_likes", {
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
        comment_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./PostComment.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return PostCommentLikes;
};
