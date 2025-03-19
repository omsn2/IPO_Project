require("dotenv").config(); // ✅ Load environment variables
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

// ✅ Ensure MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not set in .env file");
  process.exit(1);
}

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

const app = express();
app.use(cors()); // ✅ Fix: Move this to the top
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// ✅ Register Auth Router
const authRouter = require("./routers/authRouter");
app.use("/api/auth", authRouter);
console.log("✅ Auth routes loaded: /api/auth"); // ✅ Confirm route registration

app.get("/", (req, res) => {
  res.json({ message: "Hello from the server" });
});

console.log("✅ Available Routes:");
app._router.stack.forEach((middleware) => {
    if (middleware.route) { // If it's a route, print it
        console.log(`${Object.keys(middleware.route.methods).join(", ").toUpperCase()} ${middleware.route.path}`);
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server Started on Port ${PORT}`);
});
