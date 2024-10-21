const { Router } = require("express");
const router = Router();

const {
  uploadData,
  uploadMiddleware,
} = require("../../controller/common/qr&proof&doc/uploadData");
const { fetchData } = require("../../controller/common/qr&proof&doc/fetchData");

router.post("/:movementId", uploadMiddleware, uploadData);
router.get("/:movementId", fetchData);

module.exports = router;
