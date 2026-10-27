const userModel = require("../Models/userModel");
const bcryptjs = require("bcryptjs");
const Jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { firstname, secondname, email, password } = req.body;

    if (!firstname || !secondname || !password || !email) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    let isexisted = await userModel.findOne({ email });

    if (isexisted) {
      return res.status(400).json({
        message: "This email is already exist",
      });
    }

    let saveduser = await userModel.create({
      firstname,
      secondname,
      email,
      password,
    });

    const user = saveduser.toObject();
    delete user.password;

    res.status(201).json({
      status: "success",
      saveduser: user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    let fields = Object.keys(req.body);

    if (
      fields.length !== 2 ||
      !fields.includes("email") ||
      !fields.includes("password")
    ) {
      return res.status(400).json({
        message: "Only email and password are allowed",
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    let user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    let isvaild = await bcryptjs.compare(password, user.password);

    if (!isvaild) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    let token = Jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "login success",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    let { currentpassword, newpassword } = req.body;

    if (!currentpassword || !newpassword) {
      return res.status(400).json({
        status: "fail",
        message: "current password and new password are required",
      });
    }

    if (currentpassword === newpassword) {
      return res.status(400).json({
        status: "fail",
        message: "current and new password must be different",
      });
    }

    let user = await userModel.findById(req.id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "user not found",
      });
    }

    let isvaild = await bcryptjs.compare(currentpassword, user.password);

    if (!isvaild) {
      return res.status(401).json({
        status: "fail",
        message: "incorrect password",
      });
    }

    user.password = newpassword;

    await user.save();

    let token = Jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      status: "success",
      message: "password updated successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "user not found",
      });
    }

    res.status(200).json({
      status: "success",
      user: {
        _id: user._id,
        firstname: user.firstname,
        secondname: user.secondname,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  updatePassword,
  getProfile,
};
