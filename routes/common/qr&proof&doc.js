const { Router } = require("express");
const router = Router();

const {
  uploadData,
  uploadMiddleware,
} = require("../../controller/common/qr&proof&doc/uploadData");
const {
  docUpload,
  uploadDocsMiddleware,
} = require("../../controller/common/qr&proof&doc/docUpload");
const { fetchData } = require("../../controller/common/qr&proof&doc/fetchData");
const { cmnAuth } = require("../../middleware/authToken/commonAuth");

router.post("/:movementId", uploadMiddleware, uploadData);
router.post("/doc/:type/:movementId", cmnAuth, uploadDocsMiddleware, docUpload);
router.get("/:movementId", fetchData);

module.exports = router;
