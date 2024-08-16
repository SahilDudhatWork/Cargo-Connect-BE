const { Router } = require("express");
const { fetchProfile } = require("../../controller/carrier/profile/fetchProfile");
const { update } = require("../../controller/carrier/profile/update");

const router = Router();

router.get("/", fetchProfile);
router.put("/", update);

module.exports = router;
