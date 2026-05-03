const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Required for Web
const { startMonthlyAutomation } = require('./Services/automationService'); 

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const ocrRoutes = require('./routes/ocrRoutes');

const app = express();

app.use(cors({
  origin: 'https://your-frontend.vercel.app', // Allow all origins for Web
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); 


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected (Web Ready)"))
  .catch(err => console.error("❌ Connection Error:", err));


app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ocr', ocrRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  startMonthlyAutomation(); 
});