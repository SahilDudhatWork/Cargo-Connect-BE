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
const transitInfoRoute = require("./transitInfo");
const coordinatesRoute = require("./coordinates");
const settingsRoute = require("./settings");
const specialRequirementsRoute = require("./specialRequirements");
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
router.use("/transitInfo", transitInfoRoute);
router.use("/coordinates", coordinatesRoute);
router.use("/specialRequirements", specialRequirementsRoute);
router.use("/settings", settingsRoute);

module.exports = router;
