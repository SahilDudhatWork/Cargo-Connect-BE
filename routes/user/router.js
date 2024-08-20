const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const profileRoute = require("./profile");
const serviceRoute = require("./service");
const orderRoute = require("./order");
const { userAuth } = require("../../middleware/authToken/userAuth");
const { userPermission } = require("../../middleware/permission/userPermission");

router.get("/", (req, res) => {
  res.status(200).json({ message: "User routes is working!!" });
});

router.use("/auth", authRoute);

router.use(userAuth);
router.use("/profile", profileRoute);
router.use(userPermission);
router.use("/service", serviceRoute);
router.use("/order", orderRoute);

module.exports = router;
