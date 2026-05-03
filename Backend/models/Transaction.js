const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  amount: { type: Number, required: true },
  category: String,
  type: { type: String, enum: ['income', 'expense'], required: true },
  receiptImage: { type: String }, 
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);