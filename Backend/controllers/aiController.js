const Chat = require('../models/Chat');
const Session = require('../models/Session');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const Goal = require('../models/Goal');

exports.chatWithSensei = async (req, res) => {
  try {
    const { message, userData, sessionId } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" })
    const userId = req.user.id;
    await Chat.create({
      user: userId,
      sessionId: sessionId,
      text: message,
      sender: 'user'
    })
    const prompt = `You are "Sensei AI"... Context: ${JSON.stringify(userData)}... Question: ${message}`;
    const result = await model.generateContent(prompt);
    const aiReply = result.response.text();
    await Chat.create({
      user: userId,
      sessionId: sessionId,
      text: aiReply,
      sender: 'bot'
    });
    res.json({ success: true, reply: aiReply });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await Chat.find({
      user: req.user.id,
      sessionId: sessionId
    }).sort({ timestamp: 1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const session = await Session.create({ user: req.user.id });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: true, error: error.message });
  }
};


exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: true, error: error.message });
  }
};


exports.deleteSession = async (req, res) => {
  try {
    await Chat.deleteMany({ sessionId: req.params.id });
    await Session.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: true, error: error.message });
  }
};




exports.getBudgetForecast = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const transactions = await Transaction.find({ 
      user: req.user.id,
      type: 'expense',
      date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      Return ONLY a raw JSON object. Do not include markdown backticks or any introductory text.
      Data: Limit ₹${user.limit || 0}, Transactions: ${JSON.stringify(transactions)}
      Format: {"riskLevel": "Low|Medium|High", "predictedTotal": number, "tips": ["string", "string", "string"]}
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();


    const cleanJson = text.replace(/```json|```/g, "").trim(); 
    const response = JSON.parse(cleanJson);

    res.json({ success: true, forecast: response });
  } catch (error) {
    console.error("SENSEI_FORECAST_ERROR:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGoalOptimization = async (req, res) => {
  try {
    const { goalId } = req.params;
    const user = await User.findById(req.user.id);
    const goal = await Goal.findById(goalId);
    
  
    const transactions = await Transaction.find({ 
      user: req.user.id,
      date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const surplus = income - expense;

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      User Goal: ${goal.title} (Target: ₹${goal.target}, Current: ₹${goal.current})
      Monthly Income: ₹${income}, Monthly Expenses: ₹${expense}, Current Surplus: ₹${surplus}
      
      Act as a Financial Sensei. Suggest if the user can increase their goal contribution this month.
      Return ONLY a JSON object:
      {
        "recommendation": "string",
        "suggestedExtraAmount": number,
        "daysSaved": number
      }
    `;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
    res.json({ success: true, optimization: JSON.parse(cleanJson) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.categorizeTransaction = async (req, res) => {
  try {
    const { text } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a finance assistant. Categorize the following transaction text into ONE of these categories: 
      [Food, Transport, Shopping, Rent, Utilities, Health, Entertainment, Education, Others].
      
      Transaction Text: "${text}"
      
      Return ONLY the category name as a single word.
    `;

    const result = await model.generateContent(prompt);
    const category = result.response.text().trim();

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};