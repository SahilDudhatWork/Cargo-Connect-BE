const User = require("../model/user/user");
const Admin = require("../model/admin/admin");
const Carrier = require("../model/carrier/carrier");
const { handleException } = require("../helper/exception");

const hendleModel = async (res, type) => {
  try {
    let Model;
    if (type === "user") {
      Model = User;
    } else if (type === "carrier") {
      Model = Carrier;
    } else if (type === "admin") {
      Model = Admin;
    }
    return Model;
  } catch (error) {
    console.error("Error:", error);
    return handleException(logger, res, error);
  }
};

module.exports = {
  hendleModel,
};
