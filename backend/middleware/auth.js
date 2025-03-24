const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers["authorization"]; // Get token from headers

    // Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Unauthorized, JWT token is required" });
    }

    // Extract the actual token (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1];

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded; // Attach user info to request
        next(); // Proceed to the next middleware
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized, JWT token is invalid or expired" });
    }
};

module.exports = ensureAuthenticated;
