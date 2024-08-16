const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");
const profileRoute = require("./profile");
const { userAuth } = require("../../middleware/userAuth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "User routes is working!!" });
});

router.use("/auth", authRoute);

router.use(userAuth);
router.use("/profile", profileRoute);

module.exports = router;
