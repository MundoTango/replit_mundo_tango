module.exports = (sequelize, Sequelize) => {
    const WebhookLog = sequelize.define("webhook_logs", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        data: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        deletedAt: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    });

    return WebhookLog;
};
