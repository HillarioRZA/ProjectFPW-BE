const express = require('express');
const { getDashboardStats } = require('../controllers/statsController');
const router = express.Router();

router.get('/dashboard', getDashboardStats);

module.exports = router; 