const { Router } = require("express");
const {
  fetchProfile,
} = require("../../controller/operator/profile/fetchProfile");
const { update } = require("../../controller/operator/profile/update");

const router = Router();

router.get("/", fetchProfile);
router.put("/", update);

module.exports = router;
