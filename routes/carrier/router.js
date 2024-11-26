const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const profileRoute = require("./profile");
const movementRoute = require("./movement");
const operatorRoute = require("./operator");
const vehicleRoute = require("./vehicle");
const ratingRoute = require("./rating");
const subCarrierRoute = require("./subCarrier");
const notificationRoute = require("./notification");
const rolesRoute = require("./roles");
const menuAccessRoute = require("./menuAccess");
const { carrierAuth } = require("../../middleware/authToken/carrierAuth");
const {
  carrierPermission,
} = require("../../middleware/permission/carrierPermission");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Carrier routes is working!!" });
});

router.use("/auth", authRoute);

router.use(carrierAuth);
router.use("/profile", profileRoute);
router.use(carrierPermission);
router.use("/movement", movementRoute);
router.use("/operator", operatorRoute);
router.use("/vehicle", vehicleRoute);
router.use("/rating", ratingRoute);
router.use("/notification", notificationRoute);
router.use("/sub/carrier", subCarrierRoute);
router.use("/roles", rolesRoute);
router.use("/menu/access", menuAccessRoute);

module.exports = router;
