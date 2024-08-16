const { Router } = require("express");
const v1 = Router();
const adminRouter = require("./admin/router");
const carrierRouter = require("./carrier/router");
const operatorRouter = require("./operator/router");
const userRouter = require("./user/router");
const commonRouter = require("./common/router");

v1.get("/", (req, res) => {
  res.status(200).json({ message: "v1 routes is working!!" });
});

v1.use("/admin", adminRouter);
v1.use("/carrier", carrierRouter);
v1.use("/operator", operatorRouter);
v1.use("/user", userRouter);
v1.use("/common", commonRouter);

module.exports = v1;
