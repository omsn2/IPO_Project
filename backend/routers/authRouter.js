const express = require("express");
const { signup, signin } = require("../controllers/authController"); // ✅ Fixed import
const { signupValidation, signinValidation } = require("../middleware/validator");

const router = express.Router();

// ✅ Validation will be called before controller functions
router.post("/signup", signupValidation, signup);
router.post("/signin", signinValidation, signin);

module.exports = router;
