const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const profileRoute = require("./profile");
const {carrierAuth}= require("../../middleware/carrierAuth")

router.get("/", (req, res) => {
  res.status(200).json({ message: "Carrier routes is working!!" });
});

router.use("/auth", authRoute);

router.use(carrierAuth);
router.use("/profile", profileRoute);

module.exports = router;
