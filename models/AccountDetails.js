const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");
const User = require("./User");

const AccountDetails = sequelize.define("AccountDetails", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sortCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paypalEmail: {
    type: DataTypes.STRING,
  },

  // Other account-details columns...
});

AccountDetails.belongsTo(User, { foreignKey: "userId" });

module.exports = AccountDetails;
