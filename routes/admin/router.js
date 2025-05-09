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
const commonRequirementsRoute = require("./commonRequirements");
const guidelinePagesRoute = require("./guidelinePages");
const subAdminRoute = require("./subAdmin");
const menuAccessRoute = require("./menuAccess");
const rolesRoute = require("./roles");
// const documentsRoute = require("./documents");
const rateCardRoute = require("./rateCard");
const { adminAuth } = require("../../middleware/authToken/adminAuth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Admin routes is working!!" });
});

router.use("/auth", authRoute);
router.use(adminAuth);
router.use("/sub/admin", subAdminRoute);
router.use("/menu/access", menuAccessRoute);
router.use("/roles", rolesRoute);
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
router.use("/commonRequirements", commonRequirementsRoute);
router.use("/settings", settingsRoute);
router.use("/guidelinePages", guidelinePagesRoute);
// router.use("/documents", documentsRoute);
router.use("/rateCard", rateCardRoute);

module.exports = router;
