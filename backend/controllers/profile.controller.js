import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js";

export const getTypingStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const typingStatus = await user.findById(id).select("showTypingMessage");
    return res.json(typingStatus);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateTypingStatus = async (req, res) => {
    const {value} = req.body;
    const userId = req.user._id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.showTypingMessage = value;
        await user.save();
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profile-pictures-chat-app",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in updateProfile", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
