const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 }, 
  installment: { type: Number, required: true },
  months: { type: Number, required: true },
  current: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Goal", goalSchema);