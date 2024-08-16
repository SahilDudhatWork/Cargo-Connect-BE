const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const userRoute = require("./userManage");
const { adminAuth } = require("../../middleware/adminAuth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Admin routes is working!!" });
});

router.use("/auth", authRoute);
router.use(adminAuth);
router.use("/user", userRoute);

module.exports = router;
