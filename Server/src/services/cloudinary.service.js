// cloudinary.service.js
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Safely delete local temp files
// Delete local temp file
const deleteLocalFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.error("❌ Failed to delete local file:", err.message);
  }
};

exports.uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    deleteLocalFile(localFilePath);
    console.log("✅ File uploaded:", response.secure_url);
    return response;
  } catch (err) {
    deleteLocalFile(localFilePath);
    console.error("❌ Cloudinary upload failed:", err.message);
    throw err; // throw error so the caller can handle upload failures
  }
};

exports.deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return null;

  try {
    // Pass resource_type for deleting video or image assets
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (err) {
    console.error("❌ Cloudinary delete failed:", err.message);
    throw err;
  }
};
