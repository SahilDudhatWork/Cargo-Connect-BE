const { Router } = require("express");
const router = Router();

const {
  imageUpload,
} = require("../../controller/common/imageUpload/imageUpload");
const upload = require("../../middleware/imageUpload");

router.post("/", upload.single("file"), imageUpload);

module.exports = router;
