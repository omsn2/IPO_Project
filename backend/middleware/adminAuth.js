const jwt = require("jsonwebtoken");

const ensureAdmin = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Unauthorized, JWT token is required" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        if (!decoded.isAdmin) {
            return res.status(403).json({ message: "Access Denied: Admins only" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = ensureAdmin;
