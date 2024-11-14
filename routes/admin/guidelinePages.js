const { Router } = require("express");
const { create } = require("../../controller/admin/guidelinePages/create");
const {
  fetchData,
} = require("../../controller/admin/guidelinePages/fetchData");
const {
  getDetails,
} = require("../../controller/admin/guidelinePages/getDetails");
const { update } = require("../../controller/admin/guidelinePages/update");
const { remove } = require("../../controller/admin/guidelinePages/delete");
const router = Router();

router.post("/", create);
router.get("/", fetchData);
router.get("/:id", getDetails);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
