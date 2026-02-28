const cloudinary = require("../config/cloudinary");


/**
 * Upload image/video to Cloudinary
 * @param {object} file - file object from express-fileupload
 * @param {string} folder - folder name in Cloudinary
 * @param {number} width - optional width to resize
 * @param {number} height - optional height to resize
 * @param {string} quality - optional quality e.g. "auto:good"
 * @param {string} resourceType - "image" | "video" | "auto"
 */
const uploadToCloudinary = async (file, folder, width, height, quality, resourceType = "auto") => {
  try {
    const options = {
      folder,
      resource_type: resourceType,
    };

    if (width) options.width = width;
    if (height) options.height = height;
    if (width || height) options.crop = "scale"; // resize proportionally
    if (quality) options.quality = quality;

    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    return result; // contains secure_url, public_id, etc.
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    throw new Error("Cloudinary upload failed");
  }
};



/**
 * Delete file from Cloudinary
 * @param {string} publicId
 * @param {string} resourceType
 */



// const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
//   try {
//     await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
//     return true;
//   } catch (err) {
//     console.error("Cloudinary delete error:", err.message);
//     throw new Error("Cloudinary delete failed");
//   }
// };

module.exports = {
  uploadToCloudinary,
//   deleteFromCloudinary,
};
