const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wanderlust_DEV",
    allowed_formats: [
      "jpg", // JPEG Format
      "jpeg", // Alternative JPEG Extension
      "png", // Portable Network Graphics
      "gif", // Graphics Interchange Format
      "bmp", // Bitmap Image File
      "webp", // WebP Image Format
      "svg", // Scalable Vector Graphics
      "tiff", // Tagged Image File Format
      "tif", // Alternative for TIFF
      "ico", // Icon Format
      "heic", // High-Efficiency Image Format
      "heif", // Alternative HEIF Format
      "avif", // AV1 Image File Format
      "raw", // Raw Image Data
      "psd", // Adobe Photoshop Format
      "eps", // Encapsulated PostScript
      "ai", // Adobe Illustrator Format
      "xcf", // GIMP Image File Format
    ],
  },
});


module.exports={
  cloudinary,
  storage
}