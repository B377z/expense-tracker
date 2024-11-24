// routes/summary.js
const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Get expense summary
router.get('/', auth, async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    res.json(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
