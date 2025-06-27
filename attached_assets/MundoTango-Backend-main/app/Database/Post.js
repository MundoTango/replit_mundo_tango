module.exports = (sequelize, Sequelize) => {
    const Post = sequelize.define("posts", {
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
                model:  require("./User.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        group_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model:  require("./Group.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        event_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model:  require("./Event.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        activity_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model:  require("./Activity.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        feeling_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model:  require("./Feeling.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        shared_by: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model:  require("./User.js")(sequelize, Sequelize),
                key: 'id',
            },
        },
        user_travel_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model:  require("./UserTravel.js")(sequelize, Sequelize),
                key: 'user_id',
            },
        },
        is_shared: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        original_post_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        caption: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        total_likes: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        total_comments: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        total_shares: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        visibility: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['public', 'friend', 'private'],
            defaultValue: 'public'
        },
        location: {
            type: Sequelize.TEXT
        },
        country: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        city: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        latitude: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        longitude: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['active', 'inactive'],
            defaultValue: 'active'
        }
    }, {
        timestamps: true,  // Automatically manages createdAt and updatedAt
        paranoid: true,     // Enables soft deletes with deletedAt
        charset: 'utf8mb4'
    });

    return Post;
};
