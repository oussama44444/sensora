const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, default: '' },
  hand: { type: String },
  role: { type: String, enum: ['superadmin', 'user'], default: 'user' },

  // ==================== SPACE ACCESS ====================
  spaceAccess: [{
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'PadelSpace' },
    role: { type: String, enum: ['owner', 'admin', 'coach', 'user'] },
    permissions: [{
      type: String,
      enum: [
        'read_bookings',
        'write_bookings',
        'manage_courts',
        'manage_coaches',
        'view_analytics',
        'manage_users'
      ]
    }],
    joinedAt: { type: Date, default: Date.now }
  }],

  // ==================== NEW: JETONS PER SPACE ====================
  jetons: [{
    spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'PadelSpace', required: true },
    quantity: { type: Number, default: 0 }, // how many jetons user has in this space
    jetonValue: { type: Number, required: true }, // price per jeton (e.g. 25)
    currency: { type: String, default: 'DT' },
    lastUpdated: { type: Date, default: Date.now }
  }],

  // ==================== IMAGE ====================
  image: {
    type: String,
    default: "https://i.pinimg.com/474x/51/f6/fb/51f6fb256629fc755b8870c801092942.jpg"
  },

  // ==================== PROFILE ====================
  profile: {
    bestHand: { type: String, enum: ['right', 'left', 'ambidextrous'] },
    matchType: { type: String, enum: ['competition', 'friendly', 'both'] },
    preferredTime: { type: String }, // e.g., "morning", "afternoon", "evening"
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] }
  },

  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  notif_token: { type: String , default: null } 
});

// Index for fast lookup by space
userSchema.index({ 'spaceAccess.spaceId': 1, 'spaceAccess.role': 1 });
userSchema.index({ 'jetons.spaceId': 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
