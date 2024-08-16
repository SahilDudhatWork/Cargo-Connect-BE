const { Router } = require("express");
const router = Router();
const otpRoute = require("./otp");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Common routes is working!!" });
});

router.use("/otp", otpRoute);

module.exports = router;
