require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB=require('./config/db')
// Import routes
const authRoutes = require("./routes/authRoutes");
const preferenceRoutes=require('./routes/preferenceRoutes');


connectDB();

// App init
const app = express();

// Middleware
app.use(cors({
  origin: "*",
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferenceRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Pixelman API running");
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
