const express = require("express");
const { registerUser, loginUser } = require("../controller/auth");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// protected route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Access granted",
    userId: req.userId
  });
});

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Authenticated",
    userId: req.userId
  });
});


module.exports = router;
