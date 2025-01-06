const { Router } = require("express");
const router = Router();
const {
  dashboard
} = require("../../controller/admin/common/activity/dashboard");
const {
  userActivity,
} = require("../../controller/admin/common/activity/userActivity");
const {
  carrierActivity,
} = require("../../controller/admin/common/activity/carrierActivity");
const {
  serviceActivity,
} = require("../../controller/admin/common/activity/serviceActivity");

router.get("/dashboard", dashboard);
router.get("/user", userActivity);
router.get("/carrier", carrierActivity);
router.get("/service", serviceActivity);

module.exports = router;
