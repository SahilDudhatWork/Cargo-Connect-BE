const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const profileRoute = require("./profile");
const transitInfoRoute = require("./transitInfo");
const orderRoute = require("./movement");
const addressRoute = require("./address");
const specialRequirementsRoute = require("./specialRequirements");
const { userAuth } = require("../../middleware/authToken/userAuth");
const {
  userPermission,
} = require("../../middleware/permission/userPermission");

router.get("/", (req, res) => {
  res.status(200).json({ message: "User routes is working!!" });
});

router.use("/auth", authRoute);
router.use("/transitInfo", transitInfoRoute);
router.use(userAuth);
router.use("/profile", profileRoute);
router.use("/order", orderRoute);
router.use(userPermission);
router.use("/specialRequirements", specialRequirementsRoute);
router.use("/address", addressRoute);

module.exports = router;
