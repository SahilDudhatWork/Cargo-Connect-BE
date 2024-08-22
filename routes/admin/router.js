const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const commonCrudRoute = require("./commonCrud");
const profileRoute = require("./profile");
const servicesRoute = require("./services");
const { adminAuth } = require("../../middleware/authToken/adminAuth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Admin routes is working!!" });
});

router.use("/auth", authRoute);
router.use(adminAuth);
router.use("/common", commonCrudRoute);
router.use("/profile", profileRoute);
router.use("/services", servicesRoute);

module.exports = router;
