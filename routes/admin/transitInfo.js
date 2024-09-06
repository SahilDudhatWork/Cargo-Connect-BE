const { Router } = require("express");
const router = Router();
const {
  createOrUpdate,
} = require("../../controller/admin/transitInfo/createOrUpdate");
const {
  fetchTransitInfo,
} = require("../../controller/admin/transitInfo/fetchData");

router.post("/", createOrUpdate);
router.get("/", fetchTransitInfo);

module.exports = router;
