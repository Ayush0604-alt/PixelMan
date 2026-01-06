const express = require("express");
const protect = require("../middleware/authMiddleware");
const Preference = require("../models/UserPreference");

const router = express.Router();

// Get user preferences
router.get("/", protect, async (req, res) => {
  const pref = await Preference.findOne({ userId: req.userId });
  res.json(pref || {});
});


// Save/update preferences
router.post("/", protect, async (req, res) => {
  try {
    const { defaults } = req.body;

    const saved = await Preference.findOneAndUpdate(
      { userId: req.userId },  
      { defaults },
      {
        new: true,
        upsert: true,         
        setDefaultsOnInsert: true
      }
    );

    res.json({
      message: "Preferences saved",
      saved
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save preferences" });
  }
});


module.exports = router;
