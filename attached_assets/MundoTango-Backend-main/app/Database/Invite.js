module.exports = (sequelize, Sequelize) => {
    const Invite = sequelize.define("invites", {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        invite_from_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        invite_to_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        instance_type: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['group', 'event'],
            defaultValue: 'group'
        },
        instance_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM,
            allowNull: false,
            values: ['invited', 'joined', 'rejected'],
            defaultValue: 'invited',
        }
    }, {
        timestamps: true,  // Automatically adds createdAt and updatedAt
        paranoid: true,     // E
    });

    return Invite;
};
