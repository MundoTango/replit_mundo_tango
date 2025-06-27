module.exports = (sequelize, Sequelize) => {
    const GroupMember = sequelize.define("group_members", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        group_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        user_type: {
            type: Sequelize.STRING,
            allowNull: false,
            values: ['host', 'teacher', 'dj', 'photographer', 'musician', 'general', 'co-host', 'admin'],
            defaultValue: 'host'
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['invited', 'requested', 'joined', 'rejected'],
            defaultValue: 'requested'
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true
    });

    return GroupMember;
};
