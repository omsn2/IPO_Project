const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: [true, "Email must be unique"],
      trim: true,
      minLength: [5, "Email must be at least 5 characters long"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      trim: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
