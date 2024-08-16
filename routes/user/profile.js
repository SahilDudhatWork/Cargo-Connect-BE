const { Router } = require("express");
const { fetchProfile } = require("../../controller/user/profile/fetchProfile");
const { update } = require("../../controller/user/profile/update");

const router = Router();

router.get("/", fetchProfile);
router.put("/", update);

module.exports = router;
