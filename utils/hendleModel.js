const User = require("../model/user/user");
const Admin = require("../model/admin/admin");
const Carrier = require("../model/carrier/carrier");
const Operator = require("../model/operator/operator");
const Vehicle = require("../model/vehicle/vehicle");

const hendleModel = async (res, type) => {
  try {
    let Model;
    if (type === "user") {
      Model = User;
    } else if (type === "carrier") {
      Model = Carrier;
    } else if (type === "admin") {
      Model = Admin;
    } else if (type === "operator") {
      Model = Operator;
    } else if (type === "vehicle") {
      Model = Vehicle;
    }
    return Model;
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = {
  hendleModel,
};
