
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!authHeader) {
      console.log('No Authorization header provided');
      return res.status(401).json({ error: 'Token not provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      console.log('Malformed Authorization header:', authHeader);
      return res.status(401).json({ error: 'Malformed authorization header' });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('Error decoding token:', err);
        return res.status(403).json({ error: 'Failed to authenticate user' });
      }
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.firstName + ' ' + decoded.lastName,
        role: decoded.role,
      };
      next();
    });
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authenticateToken;
