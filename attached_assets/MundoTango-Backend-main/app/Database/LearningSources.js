module.exports = (sequelize, Sequelize) => {
    const Learning_Sources = sequelize.define("learning_sources", {
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
        first_teacher: {
            type: Sequelize.STRING,
            allowNull: true
        },
        leading_teachers: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        chacarera_skill: {
            type: Sequelize.STRING,
            allowNull: true
        },
        tango_story: {
            type: Sequelize.STRING,
            allowNull: true
        },
        zamba_skill: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        visited_buenos_aires: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        visited_buenos_aires_at: {
            type: Sequelize.STRING,
            allowNull: true
        },
        visited_buenos_aires_end_at: {
            type: Sequelize.STRING,
            allowNull: true
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true

    });

    return Learning_Sources;
}
