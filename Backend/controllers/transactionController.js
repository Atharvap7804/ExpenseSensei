


const Transaction = require('../models/Transaction');

exports.addTransaction = async (req, res) => {
  try {
    const { type, amount, category, note, date, receiptImage } = req.body;
    const transaction = new Transaction({
      user: req.user.id,
      type,
      amount: parseFloat(amount),
      category: category || "Other",
      title: note,
      note: note || "",
      receiptImage: receiptImage,
      date: date || Date.now()
    });
    await transaction.save();
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
const User = require('../models/User');

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
    const user = await User.findById(userId);
    res.json({ success: true, transactions, user: { limit: user.limit } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};