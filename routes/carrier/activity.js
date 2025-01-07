const { Router } = require("express");
const router = Router();
const {
  dashboard,
} = require("../../controller/carrier/activity/dashboard");

router.get("/dashboard", dashboard);

module.exports = router;
