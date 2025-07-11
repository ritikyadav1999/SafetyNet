const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: { type: String },

    password: {
      type: String,
      required: true,
    },

    hasPassword: { type: Boolean, default: false },

    isAdmin: { type: Boolean, default: false },

    // ✅ SOS-specific fields
    isResponder: { type: Boolean, default: false }, // Is this user available to respond to SOS
    canSendSOS: { type: Boolean, default: true },   // Can this user trigger an SOS
    lastSOSAt: { type: Date },                      // Last time user triggered an SOS

    isBanned: { type: Boolean, default: false },    // Admin control

    // ✅ Location fields
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    lastKnownLocationAt: { type: Date },           // When the location was last updated

    isOnline: { type: Boolean, default: false },   // Used for live presence tracking (optional)
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Normalize email before saving
UserSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
