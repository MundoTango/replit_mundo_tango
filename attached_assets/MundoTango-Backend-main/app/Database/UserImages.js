const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const UserImages = sequelize.define("user_images", {
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
        image_url: {
            type: Sequelize.STRING,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('image_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        },
        is_default: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return UserImages;
}