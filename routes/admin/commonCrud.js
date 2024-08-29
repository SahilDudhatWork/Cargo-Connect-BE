const { Router } = require("express");
const router = Router();
const {
  uploadMiddleware,
  create,
} = require("../../controller/admin/common/crud/create");
const { fetchData } = require("../../controller/admin/common/crud/fetchData");
const { getDetails } = require("../../controller/admin/common/crud/getDetails");
const { update } = require("../../controller/admin/common/crud/update");
const { remove } = require("../../controller/admin/common/crud/delete");
const {
  validateEmailAndPassword,
} = require("../../middleware/validateEmailAndPass");

router.post("/:type/", uploadMiddleware, validateEmailAndPassword, create);
router.get("/:type/", fetchData);
router.get("/:type/:id", getDetails);
router.put("/:type/:id", update);
router.delete("/:type/:id", remove);

module.exports = router;
