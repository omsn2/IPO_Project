const jwt = require("jsonwebtoken");
const { doHash, doHashValidation } = require("../utils/hashing");
const UserModel = require("../models/usersModel");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) {
      return res
        .status(409)
        .json({
          message: "User already exists, you can login",
          success: false,
        });
    }

    // Hash the password before saving
    const hashedPassword = await doHash(password, 12);

    // Create new user
    const newUser = new UserModel({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

const signin = async (req, res) => {
  // ✅ Correct function name
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select("+password");
    const errorMsg = "Auth failed email or password is wrong";

    if (!user) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    if (!user.password) { 
      return res.status(500).json({ message: "Internal server error: No password found for user", success: false });
    }

    const isPasswordValid = await doHashValidation(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({ message: errorMsg, success: false });
    }

    res.status(201).json({
      message: "User login successfully",
      success: true,
    });

    const jwtToken = jwt.sign(
     {_id: user._id, email: user.email},
     process.env.TOKEN_SECRET,
     { expiresIn: "24h" }
    )
    res.status(200)
    .json({
      message: "User login successfully",
      success: true,
      jwtToken,
      email,
      name: user.name
    })


  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports = { signup, signin }; // ✅ Correct export
