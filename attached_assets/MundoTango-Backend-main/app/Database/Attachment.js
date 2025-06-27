const {BASE_URL} = require("../config/constants");
module.exports = (sequelize, Sequelize) => {
    const Attachment = sequelize.define("attachments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        instance_type: {
            type: Sequelize.STRING
        },
        instance_id: {
            type: Sequelize.INTEGER
        },
        media_type: {
            type: Sequelize.STRING
        },
        media_url: {
            type: Sequelize.STRING,
            get() {
                const rawValue = this.getDataValue('media_url');
                if(rawValue) return `${BASE_URL}${rawValue}`;
                else return ""
            }
        },
        thumbnail_url: {
            type: Sequelize.STRING
        }
    }, {
        onDelete: 'cascade',
        timestamps: true,
        paranoid: true
    });

    return Attachment;
}
