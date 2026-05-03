const express = require('express');
const router = express.Router();
const { extractReceiptData } = require('../controllers/ocrController');
const auth = require('../middleware/authMiddleware');


router.post('/extract', auth, extractReceiptData);

module.exports = router;