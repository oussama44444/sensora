
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log("Token:", token);
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("Error decoding token:", err);
      return res.status(403).json({ error: "Failed to authenticate user" });
    }
    console.log("Decoded token:", decoded);
    req.user = {};
    req.user.userId = decoded.userId;
    req.user.email = decoded.email;
    req.user.name = decoded.name;
    req.user.role = decoded.role;
    console.log("Authenticated user:", req.user);
    next();
  });
};

module.exports = authenticateToken;
