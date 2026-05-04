const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend"); // 🔥 NEW: Using API instead of SMTP

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 🔥 Send Welcome Email via Resend API
    await resend.emails.send({
      from: 'ExpenseSensei <onboarding@resend.dev>',
      to: savedUser.email,
      subject: "Welcome to ExpenseSensei! ✨",
      html: `<strong>Hello, ${savedUser.name}! 👋 Your account is now active.</strong>`
    }).catch(err => console.log("Welcome Email Error:", err.message));

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

exports.sendOTP = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { currentOTP: otp }, 
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    // 🔥 FOR MASTER'S DEMO: Always log the code in case of API delays
    console.log("-----------------------------------------");
    console.log(`🔑 SENSEI ACCESS CODE FOR ${user.email}: [ ${otp} ]`);
    console.log("-----------------------------------------");

    // 🔥 NEW: Send OTP via Resend API (HTTPS based, won't be blocked)
    const { data, error } = await resend.emails.send({
      from: 'Sensei Security <onboarding@resend.dev>',
      to: user.email,
      subject: `Access Code: ${otp}`,
      html: `<p>Your ExpenseSensei verification code is: <strong>${otp}</strong></p>`
    });

    if (error) {
      console.error("Resend Dispatch Error:", error.message);
      return res.status(500).json({ success: false, msg: "Mail server error" });
    }

    return res.json({ success: true, msg: "OTP Sent Successfully" });

  } catch (error) {
    console.error("SEND_OTP_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.currentOTP) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    if (user.currentOTP.trim() === otp.trim()) {
      user.currentOTP = null; 
      await user.save();
      return res.status(200).json({ success: true, message: "Identity verified." });
    } else {
      return res.status(400).json({ success: false, message: "Invalid code." });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
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

    // 1. Delete all transactions belonging to this user
    await Transaction.deleteMany({ user: userId });

    // 2. Delete all goals belonging to this user
    await Goal.deleteMany({ user: userId });

    // 3. Optional Safeguard: Wipe goals with no user (orphans)
    // This removes that "Hero Xtreme" goal you saw in Atlas
    await Goal.deleteMany({ user: null });

    // 4. Finally delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Account and associated data purged successfully" });
  } catch (err) {
    console.error("DELETE_ACCOUNT_ERROR:", err);
    res.status(500).json({ success: false, message: "Server error during deletion" });
  }
};