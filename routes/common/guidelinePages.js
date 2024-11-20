const { Router } = require("express");
const {
  fetchGuidelinePages,
} = require("../../controller/common/guidelinePages/fetchGuidelinePages");
const {
  fetchSingleGuideline,
} = require("../../controller/common/guidelinePages/fetchSingleGuideline");
const router = Router();

router.get("/:type", fetchGuidelinePages);
router.get("/:type/:title", fetchSingleGuideline);

module.exports = router;
