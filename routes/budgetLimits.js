// routes/budgetLimits.js
const express = require('express');
const BudgetLimit = require('../models/BudgetLimit');
const auth = require('../middleware/auth');

const router = express.Router();

// Set budget limit
router.post('/', auth, async (req, res) => {
  const { category, limit } = req.body;
  try {
    const budgetLimit = new BudgetLimit({
      user: req.user.id,
      category,
      limit,
    });
    await budgetLimit.save();
    res.json(budgetLimit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get budget limits
router.get('/', auth, async (req, res) => {
  try {
    const budgetLimits = await BudgetLimit.find({ user: req.user.id });
    res.json(budgetLimits);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

