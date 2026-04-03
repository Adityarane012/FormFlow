const cloudinary = require("cloudinary").v2;

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    return true;
  }
  return false;
}

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const configured = configureCloudinary();
    if (!configured) {
      return res.status(503).json({
        error:
          "Cloudinary is not configured. Set CLOUDINARY_* env vars in backend/.env",
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "formflow/uploads",
      resource_type: "auto",
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
}

module.exports = { uploadFile, configureCloudinary };
