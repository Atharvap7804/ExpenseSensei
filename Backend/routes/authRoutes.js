const express = require("express");
const router = express.Router();


const auth = require("../middleware/authMiddleware");


const { 
  registerUser, 
  loginUser, 
  updateLimit,
  deleteAccount,
  sendOTP,
  verifyOTP
} = require("../controllers/authController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.put("/limit", auth, updateLimit);
router.delete('/delete-account', auth, deleteAccount);
router.post('/send-otp', auth, sendOTP);
router.post('/verify-otp', auth, verifyOTP);

module.exports = router;