const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "first name must be written"],
      minLength: [3, "first name must be at least 3 char"],
      maxLength: [15, "first name must be at most 15 char"],
      trim: true,
    },

    secondname: {
      type: String,
      required: [true, "second name must be written"],
      minLength: [3, "second name must be at least 3 char"],
      maxLength: [15, "second name must be at most 15 char"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "email must be written"],
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: [true, "password must be written"],
      minLength: [8, "password must be at least 8 char"],
      maxLength: [15, "password must be at most 15 char"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});
const User = mongoose.model("User", userSchema);

module.exports = User;
