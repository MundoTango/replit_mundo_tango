const { LOGIN_TYPE } = require("../config/enum.js");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_group_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: require("./UserGroups.js")(sequelize, Sequelize),
        key: "id",
      },
    },
    user_type: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "user",
    },
    first_name: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    last_name: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    username: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    gender: {
      type: Sequelize.STRING(30),
      allowNull: true,
    },
    slug: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    },
    mobile_no: {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_url: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    is_email_verify: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    email_verifyAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    is_mobile_verify: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    mobile_verifyAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    is_activated: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    is_blocked: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    login_type: {
      type: Sequelize.STRING(30),
      defaultValue: LOGIN_TYPE.CUSTOM,
      allowNull: true,
    },
    platform_type: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    platform_id: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    fcm_token: {
      type: Sequelize.TEXT,
    },
    is_push_notifcation: {
      type: Sequelize.INTEGER,
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  });

  return User;
};
