const { Router } = require("express");
const authRoute = require("./auth");
const movementRoute = require("./movement");
const profileRoute = require("./profile");
const lat_LongRoute = require("./lat_Long");
const { operatorAuth } = require("../../middleware/authToken/operatorAuth");
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Operator routes is working!!" });
});

router.use("/auth", authRoute);
router.use(operatorAuth);
router.use("/movement", movementRoute);
router.use("/profile", profileRoute);
router.use("/lat&Long", lat_LongRoute);

module.exports = router;
