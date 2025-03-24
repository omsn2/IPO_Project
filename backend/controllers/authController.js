require("dotenv").config();
const jwt = require("jsonwebtoken");
const { doHash, doHashValidation } = require("../utils/hashing");
const UserModel = require("../models/UsersModel");
const { default: axios } = require("axios");

// OAUTH2 implementation ("LOGIN in WITH GOOGLE")
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;
const redirect_url = process.env.REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;



/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */

// Define admin emails
const ADMIN_EMAILS = ["admin@example.com"]; 

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (Admin or Normal User)
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "User already exists", success: false });
    }

    // Hash the password before saving
    const hashedPassword = await doHash(password, 12);

    //  Explicitly set `isAdmin: true` ONLY for predefined admin emails
    const isAdmin = ADMIN_EMAILS.includes(email) ? true : false;

    // Create and save the user
    const newUser = new UserModel({ 
        name, 
        email, 
        password: hashedPassword, 
        isAdmin  // Ensures normal users always get `false`
    });

    await newUser.save();

    return res.status(201).json({
      message: isAdmin ? "Admin registered successfully" : "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

/**
 * @route   POST /api/auth/signin
 * @desc    Login user and return JWT token
 * @access  Public
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errorMsg = "Auth failed: Email or password is incorrect";

    // Find user with email
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) return res.status(403).json({ message: errorMsg, success: false });

    // Validate password
    const isPasswordValid = await doHashValidation(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ message: errorMsg, success: false });

    // Generate JWT token including isAdmin field
    const jwtToken = jwt.sign(
      { _id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      jwtToken,
      email,
      name: user.name,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// sign out 
const signout = async (req, res) => {
  res.clearCookie('Authorization')
  return res.status(200).json({
    message: "User logged out successfully",
    success: true,
})
}





/**
 * @route   GET /api/auth/google
 * @desc    Redirect user to Google OAuth2 login
 */
const googleAuth = async (req, res) => {
  try {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth
      ?response_type=code
      &client_id=${GOOGLE_CLIENT_ID}
      &redirect_uri=${REDIRECT_URI}
      &scope=email%20profile
      &access_type=offline
      &state=randomString123`; // ✅ Added `state` to prevent CSRF attacks

    res.redirect(googleAuthUrl);
  } catch (error) {
    console.error("🔥 Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth2 callback and user authentication
 */
const googleAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: "Authorization code is missing" });

    // ✅ Exchange code for Google access token
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    });

    const { access_token } = tokenResponse.data;
    if (!access_token) throw new Error("Failed to get access token");

    // ✅ Fetch user profile from Google
    const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const googleUser = userResponse.data; // { id, email, name, picture }

    // ✅ Check if user exists in DB
    let user = await UserModel.findOne({ email: googleUser.email });

    if (!user) {
      // ✅ Create a new user in MongoDB
      user = new UserModel({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        avatar: googleUser.picture, // Store profile picture
        password: null, // No password for Google login
        isAdmin: false, // Ensure role is set properly
      });

      await user.save();
    }

    // ✅ Generate JWT token
    const jwtToken = jwt.sign(
      { _id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}?token=${jwtToken}`);
  } catch (error) {
    console.error("🔥 Google OAuth Callback Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
module.exports = { signup, signin , googleAuth, googleAuthCallback  , signout};
  