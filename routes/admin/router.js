const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const userAndCarrierRoute = require("./userAndCarrier");
const operatorRoute = require("./operator");
const vehicleRoute = require("./vehicle");
const profileRoute = require("./profile");
const servicesRoute = require("./services");
const activityRoute = require("./activity");
const bannersRoute = require("./banners");
const { adminAuth } = require("../../middleware/authToken/adminAuth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Admin routes is working!!" });
});

router.use("/auth", authRoute);
router.use(adminAuth);
router.use("/profile", profileRoute);
router.use("/module", userAndCarrierRoute);
router.use("/operator", operatorRoute);
router.use("/vehicle", vehicleRoute);
router.use("/services", servicesRoute);
router.use("/activity", activityRoute);
router.use("/banners", bannersRoute);

module.exports = router;
