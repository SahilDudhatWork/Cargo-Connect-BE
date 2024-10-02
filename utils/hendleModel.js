const Admin = require("../model/admin/admin");
const Banners = require("../model/admin/banners");
const User = require("../model/user/user");
const Carrier = require("../model/carrier/carrier");
const Operator = require("../model/operator/operator");
const Vehicle = require("../model/vehicle/vehicle");

const hendleModel = async (type) => {
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
    } else if (type === "banners") {
      Model = Banners;
    }
    return Model;
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = {
  hendleModel,
};
