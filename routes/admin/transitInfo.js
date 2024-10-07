const { Router } = require("express");
const router = Router();
const {
  createOrUpdate,
} = require("../../controller/admin/transitInfo/createOrUpdate");
const {
  fetchTransitInfo,
} = require("../../controller/admin/transitInfo/fetchData");
const { getEntry } = require("../../controller/admin/transitInfo/getEntry");
const { addEntry } = require("../../controller/admin/transitInfo/addEntry");
const {
  updateEntry,
} = require("../../controller/admin/transitInfo/updateEntry");
const {
  deleteEntry,
} = require("../../controller/admin/transitInfo/deleteEntry");

router.post("/", createOrUpdate);
router.get("/", fetchTransitInfo);
router.post("/:field/:subfield?", addEntry);
router.get("/:field/:subfield?/:subId", getEntry);
router.put("/:field/:subfield?/:subId", updateEntry);
router.delete("/:field/:subfield?/:subId", deleteEntry);

module.exports = router;
