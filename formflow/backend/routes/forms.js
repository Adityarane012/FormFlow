const express = require("express");
const router = express.Router();
const {
  createForm,
  getForm,
  updateForm,
} = require("../controllers/formController");

router.post("/", createForm);
router.get("/:id", getForm);
router.patch("/:id", updateForm);

module.exports = router;
