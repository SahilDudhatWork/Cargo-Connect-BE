const { Router } = require("express");
const router = Router();
const otpRoute = require("./otp");
const resetPasswordRoute = require("./resetPassword");
const tokenVerifyRoute = require("./tokenVerify");
const bennersRoute = require("./benners");
const imgDeleteRoute = require("./imgDelete");
const locatOperatorRoute = require("./locatOperator");
const qr_Proof_Doc_Route = require("./qr&proof&doc");
const fetchGuidelinePagesRoute = require("./guidelinePages");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Common routes is working!!" });
});

router.use("/tokenVerify", tokenVerifyRoute);
router.use("/otp", otpRoute);
router.use("/resetPassword", resetPasswordRoute);
router.use("/qr&proof&doc", qr_Proof_Doc_Route);
router.use("/benners", bennersRoute);
router.use("/imgDelete", imgDeleteRoute);
router.use("/locat/operator", locatOperatorRoute);
router.use("/guidelinePages", fetchGuidelinePagesRoute);

module.exports = router;
