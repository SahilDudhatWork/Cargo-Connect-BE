const { Router } = require("express");
const router = Router();
const otpRoute = require("./otp");
const resetPasswordRoute = require("./resetPassword");
const imageUploadRoute = require("./imageUpload");
const tokenVerifyRoute = require("./tokenVerify");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Common routes is working!!" });
});

router.use("/tokenVerify", tokenVerifyRoute);
router.use("/otp", otpRoute);
router.use("/resetPassword", resetPasswordRoute);
router.use("/imageUpload", imageUploadRoute);

module.exports = router;
