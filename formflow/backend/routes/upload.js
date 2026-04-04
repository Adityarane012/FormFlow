const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");

/**
 * @route   POST /api/upload
 * @desc    Upload file to Cloudinary
 * @access  Public
 */
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const stream = cloudinary.uploader.upload_stream(
    { 
      folder: "formflow_uploads",
      resource_type: "auto"
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary Upload Error:", error);
        return res.status(500).json({ error: "Upload failed" });
      }
      res.json({ 
        url: result.secure_url 
      });
    }
  );

  stream.end(req.file.buffer);
});

module.exports = router;
