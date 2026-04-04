const express = require("express");
const router = express.Router();
const {
  getForms,
  createForm,
  getForm,
  updateForm,
} = require("../controllers/formController");

router.get("/", getForms);
router.post("/", createForm);
router.get("/:id", getForm);
router.patch("/:id", updateForm);

module.exports = router;
