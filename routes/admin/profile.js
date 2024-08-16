const { Router } = require("express");
const router = Router();
const { fetchProfile } = require("../../controller/admin/profile/fetchProfile");

router.get("/",fetchProfile);

module.exports = router;
