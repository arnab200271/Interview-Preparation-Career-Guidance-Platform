const cloudinary = require("./Cloudinary.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const storage = new CloudinaryStorage({
   cloudinary: cloudinary,
  params: {
    folder: "cloudenary-image",
    allow_format: ["jpg", "png", "jpeg"],
    public_id: (req, file) =>
      file.originalname.split(" ").join("-") + "-" + Date.now(),
  },
});

const uplodTocloudenary = multer({
    storage:storage
})
module.exports = uplodTocloudenary