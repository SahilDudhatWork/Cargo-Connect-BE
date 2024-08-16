const { Router } = require("express");
const router = Router();
const authRoute = require("./auth");

router.get("/", (req, res) => {
  res.status(200).json({ message: "Carrier routes is working!!" });
});

router.use("/auth", authRoute);

module.exports = router;
