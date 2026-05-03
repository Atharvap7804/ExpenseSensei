const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions } = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');


router.use(authMiddleware);

router.post('/', addTransaction); 
router.get('/', getTransactions);  


module.exports = router;