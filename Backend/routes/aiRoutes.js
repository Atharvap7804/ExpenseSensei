const express = require('express');
const router = express.Router();
const { chatWithSensei,getChatHistory,getSessions,createSession,deleteSession,getBudgetForecast,getGoalOptimization,categorizeTransaction } = require('../controllers/aiController');
const auth = require('../middleware/authMiddleware');

router.post('/chat', auth, chatWithSensei);
// routes/aiRoutes.js
router.get('/sessions', auth, getSessions);  // load the sidebar list
router.post('/session', auth, createSession);   
router.delete('/session/:id', auth, deleteSession);
router.get('/history/:sessionId', auth, getChatHistory); //load specific chat messages
router.get('/budget-forecast', auth, getBudgetForecast);
router.get('/goal-optimization/:goalId', auth, getGoalOptimization);
router.post('/categorize', auth, categorizeTransaction);
module.exports = router;