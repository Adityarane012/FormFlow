const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../controllers/uploadController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.post("/", upload.single("file"), uploadFile);

module.exports = router;
