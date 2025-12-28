const jwt = require('jsonwebtoken');
const User = require('../models/user');
const PadelSpace = require('../models/padelSpace');

const spaceAuth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      console.log("spaceAuth middleware triggered");
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Access denied. No token provided.' 
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.verified) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token.' 
        });
      }
      
      if (!user.spaceAccess || user.spaceAccess.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'User has no space access.' 
        });
      }

      // ✅ Loop through all spaceAccess entries
      let validSpaceAccess = null;
      let space = null;

      for (const access of user.spaceAccess) {
        const candidateSpace = await PadelSpace.findById(access.spaceId);

        if (candidateSpace && candidateSpace.isActive) {
          // If permissions are required, check them here
          if (requiredPermissions.length > 0) {
            const hasPermission = requiredPermissions.every(permission =>
              access.permissions.includes(permission) || access.role === 'owner'
            );
            if (!hasPermission) {
              continue; // skip this space if permissions don’t match
            }
          }

          // Found a valid space
          validSpaceAccess = access;
          space = candidateSpace;
          break;
        }
      }

      if (!validSpaceAccess) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied to any space.' 
        });
      }

      // Attach to req
      req.user = decoded;
      req.spaceId = validSpaceAccess.spaceId;
      req.userSpaceRole = validSpaceAccess.role;
      req.userPermissions = validSpaceAccess.permissions;
      req.space = space;
      console.log(space)
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false, 
        message: 'error Invalid token.',
        error: error.message
      });
    }
  };
};

module.exports = spaceAuth;
