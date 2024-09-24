const { Router } = require("express");
const router = Router();
const otpRoute = require("./otp");
const resetPasswordRoute = require("./resetPassword");
const tokenVerifyRoute = require("./tokenVerify");
const qrAndProofRoute = require("./qr&proof");
const bennersRoute = require("./benners");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Common routes is working!!" });
});

router.use("/tokenVerify", tokenVerifyRoute);
router.use("/otp", otpRoute);
router.use("/resetPassword", resetPasswordRoute);
router.use("/qr&proof", qrAndProofRoute);
router.use("/benners", bennersRoute);

module.exports = router;
