const User = require("../models/User");

exports.uploadImg = async (req, res,next) => {
  try {
    // req.file for single upload
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // Image path (if needed for DB)
    const imagePath = `/images/${image.filename}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      fileName: image.filename,
      url: imagePath,
    });

  } catch (error) {
   next(error);  
  }
};



exports.addProfileImg = async (req, res, next) => {
  try {
    const userId = req.user?._id;   // ✅ fixed
    const { url } = req.body;       // ✅ clean destructuring

    if (!url) {
      return res.status(400).json({
        message: "Image URL is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: url },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
