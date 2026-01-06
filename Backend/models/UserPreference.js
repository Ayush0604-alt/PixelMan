const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true  
  },
  defaults: {
    brightness: { type: Number, default: 100 },
    contrast: { type: Number, default: 100 },
    saturation: { type: Number, default: 100 },
    blur: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model("UserPreference", preferenceSchema);
