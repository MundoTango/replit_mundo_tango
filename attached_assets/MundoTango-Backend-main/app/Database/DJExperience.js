module.exports = (sequelize, Sequelize) => {
    const DJ_Experience = sequelize.define("dj_experience", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            references: {
                model: require("./User.js")(sequelize, Sequelize),
                key: 'id'
            }
        },
        performed_events: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        cities: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        favourite_orchestra: {
            type: Sequelize.STRING,
            allowNull: true
        },
        favourite_singer: {
            type: Sequelize.STRING,
            allowNull: true
        },
        milonga_size: {
            type: Sequelize.STRING,
            allowNull: true
        },
        use_external_equipments: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        dj_softwares: {
            type: Sequelize.TEXT,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return DJ_Experience;
}
