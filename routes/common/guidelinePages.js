const { Router } = require("express");
const {
  fetchGuidelinePages,
} = require("../../controller/common/guidelinePages/fetchGuidelinePages");
const router = Router();

router.get("/:type", fetchGuidelinePages);

module.exports = router;
