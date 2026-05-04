const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // 🔥 Using Axios for Brevo API calls[cite: 4]

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");

// Helper function for Brevo API calls to keep code clean
const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: "ExpenseSensei", email: process.env.EMAIL_USER },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    console.log(`📧 Email sent successfully to: ${toEmail}`);
  } catch (error) {
    console.error("Brevo API Error:", error.response?.data || error.message);
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, gender, mobile, limit } = req.body;
    const passwordRegex = /^(?=.*[A-Z])(?=(?:.*\d){3,})(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Security Key Weak! Requirement: 8+ chars, 1 Capital, 1 Special, 3 Numbers." });
    }
    if (!name || !email || !password || !gender || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) { return res.status(400).json({ message: "User already exists" }); }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      mobile,
      limit: limit || 0
    });
    
    const savedUser = await newUser.save();

    // 🔥 Send Welcome Email via Brevo API
    const welcomeHtml = `<strong>Hello, ${savedUser.name}! 👋 Your account is now active on ExpenseSensei.</strong>`;
    sendBrevoEmail(savedUser.email, "Welcome to ExpenseSensei! ✨", welcomeHtml);

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      user: { id: savedUser._id, name, email, gender, mobile },
      token
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        mobile: user.mobile,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/authController.js

exports.sendOTP = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { currentOTP: otp, otpExpires: expiry }, // Store expiry in DB
      { new: true }
    );

    // Update the Mail Content to mention the 5-minute limit
    const otpHtml = `
      <div style="font-family: sans-serif; padding: 20px; background: #000; color: #fff; border-radius: 20px;">
        <h2 style="color: #a855f7;">Sensei Access Code</h2>
        <p>Your verification code is: <b style="font-size: 24px;">${otp}</b></p>
        <p style="color: #666; font-size: 12px;">This code is valid for 5 minutes only. Do not share it.</p>
      </div>`;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: "Sensei Security", email: process.env.EMAIL_FROM },
      to: [{ email: user.email }],
      subject: `Access Code: ${otp} (Valid for 5m)`,
      htmlContent: otpHtml
    }, { headers: { 'api-key': process.env.BREVO_API_KEY } });

    return res.json({ success: true, msg: "OTP Sent" });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ success: false }); }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    // 🔥 Check if OTP exists and is NOT expired
    if (!user || !user.currentOTP || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: "Code expired. Request a new one." });
    }

    if (user.currentOTP.trim() === otp.trim()) {
      user.currentOTP = null; 
      user.otpExpires = null;
      await user.save();
      return res.status(200).json({ success: true, message: "Identity verified." });
    } else {
      return res.status(400).json({ success: false, message: "Invalid code." });
    }
  } catch (err) { res.status(500).json({ success: false }); }
};

exports.updateLimit = async (req, res) => {
  try {
    const { limit, income } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const today = new Date();
    const lastReset = user.lastResetDate ? new Date(user.lastResetDate) : new Date();
    const diffTime = Math.abs(today - lastReset);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 30) {
      const remainingBudget = (user.limit || 0) - (user.currentMonthExpenses || 0);
      if (remainingBudget > 0) {
        user.savings = (user.savings || 0) + remainingBudget;
      }
      user.currentMonthExpenses = 0;
      user.income = 0;
      user.lastResetDate = today;
    }

    user.limit = Number(limit);
    if (income) user.income = Number(income);

    await user.save();

    res.json({
      success: true,
      limit: user.limit,
      income: user.income,
      savings: user.savings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await Transaction.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });
    await Goal.deleteMany({ user: null });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Account purged successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};