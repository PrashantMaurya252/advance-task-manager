import User from "../models/user.model";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

const registerUser = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    const isEmailExist = await User.find({ email });
    if (isEmailExist)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const user = await User.create({ email, name, password, role });
    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: "User created success",
      user: {
        id: user._id,
        username: user.name,
        role: user.role,
        email: user.email,
      },
      token: token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error registerUser", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.find({ email });
    if (!user || !user.matchPassword(password)) {
      return res.status(401).json({ success: false, message: "Unauthorize" });
    }

    const token = generateToken(user);
    return res.status(200).json({
      success: true,
      message: "User login successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.name,
      },
      token: token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error loginUser", error: error.message });
  }
};

export {registerUser,loginUser}
