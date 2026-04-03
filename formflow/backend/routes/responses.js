const express = require("express");
const router = express.Router();
const {
  createResponse,
  listResponses,
} = require("../controllers/responseController");

router.post("/", createResponse);
router.get("/:formId", listResponses);

module.exports = router;
