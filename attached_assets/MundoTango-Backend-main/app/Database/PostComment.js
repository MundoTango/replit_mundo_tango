module.exports = (sequelize, Sequelize) => {
    const PostComment = sequelize.define("post_comments", {
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
                model: 'post_comments',
                key: 'id',
            },
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
        post_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: require("./Post.js")(sequelize, Sequelize), // Name of the related table
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        comment: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        total_likes: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
    });

    return PostComment;
};
