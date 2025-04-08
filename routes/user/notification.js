const { Router } = require("express");
const { update } = require("../../controller/user/notification/tokenUpdate");
const {
  getNotification,
} = require("../../controller/user/notification/getNotification");
const {
  notificationUpdate,
} = require("../../controller/common/notification/notificationUpdate");
const {
  notificationMarkAllRead,
} = require("../../controller/user/notification/notificationMarkAllRead");

const router = Router();

router.get("/", getNotification);
router.put("/mark/read/:id", notificationUpdate);
router.put("/mark/all/read", notificationMarkAllRead);
router.put("/token", update);

module.exports = router;
