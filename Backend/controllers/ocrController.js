





const { createWorker } = require('tesseract.js');

exports.extractReceiptData = async (req, res) => {
  let worker;
  try {
    const { image } = req.body;
    worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(image);
    await worker.terminate();
    const cleanText = text.replace(/[^\x20-\x7E\n]/g, '');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const allNumbers = cleanText.match(/\d+\.\d{2}/g) || [];
    const numericValues = allNumbers.map(n => parseFloat(n));
    const totalAmount = numericValues.length > 0 ? Math.max(...numericValues) : "";
    const potentialMerchants = lines.filter(l => 
      !l.match(/\d{4}/) &&
      !l.match(/\d{10}/) &&
      l.length > 5
    );
    const merchant = potentialMerchants[0] || "New Expense";
    const lowerText = cleanText.toLowerCase();
    let category = "Shopping";
    if (lowerText.includes("veg") || lowerText.includes("paneer") || lowerText.includes("hotel")) category = "Food";
    if (lowerText.includes("petrol") || lowerText.includes("cng") || lowerText.includes("fuel")) category = "Transport";
    res.json({ 
      success: true, 
      data: { amount: totalAmount, merchant, category, receiptImage: image } 
    });
  } catch (error) {
    if (worker) await worker.terminate();
    res.status(500).json({ success: false, error: "AI failed to parse clearly." });
  }
};