const { Router } = require("express");
const { update } = require("../../controller/carrier/notification/tokenUpdate");
const { getNotification } = require("../../controller/carrier/notification/getNotification");
const { notificationUpdate } = require("../../controller/common/notification/notificationUpdate");
const { notificationMarkAllRead } = require("../../controller/carrier/notification/notificationMarkAllRead");

const router = Router();

router.get("/", getNotification);
router.put("/mark/read/:id", notificationUpdate);
router.put("/mark/all/read", notificationMarkAllRead);
router.put("/token", update);

module.exports = router;
