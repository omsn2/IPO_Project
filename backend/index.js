require("dotenv").config(); //  Load environment variables
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

//  Register Authentication Routes
const authRouter = require("./routers/authRouter");

const adminRoutes = require("./routers/adminRoutes");
const ipoRouter = require("./routers/ipoRouter");


//  Ensure MONGO_URI is defined
if (!process.env.MONGO_URI) {
  console.error(" Error: MONGO_URI is not set in .env file");
  process.exit(1);
}


//  Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => {
    console.error(" MongoDB Connection Failed:", err);
    process.exit(1);
  });


const app = express();
app.use(cors()); //  Enable CORS for API requests
app.use(express.json()); //  Parse JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); //  Enable Cookie support
app.use(helmet()); //  Secure the app with Helmet

//Router
app.use("/api/auth", authRouter);
console.log(" Auth routes loaded: /api/auth");

app.use("/api/admin/ipo", adminRoutes);
console.log(" admin routes loaded: /api/ipo");

app.use("/api/ipo", ipoRouter);
console.log(" user routes loaded: /api/ipo");



// Default Route
app.get("/", (req, res) => {
  res.json({ message: "Hello from the server" });
});

//  Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server Started on Port ${PORT}`);
});
