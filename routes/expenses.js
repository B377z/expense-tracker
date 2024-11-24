// routes/expenses.js
const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const BudgetLimit = require('../models/BudgetLimit');
const auth = require('../middleware/auth');
const sendNotification = require('../utils/sendNotification');

const router = express.Router();

// Add expense
router.post('/', auth, async (req, res) => {
  const { amount, category, description } = req.body;
  try {
    const expense = new Expense({
      user: req.user.id,
      amount,
      category,
      description,
    });
    await expense.save();

    // Calculate total expenses for the category this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const totalExpenses = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), category, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get the budget limit for the category
    const budgetLimit = await BudgetLimit.findOne({ user: req.user.id, category });

    if (budgetLimit && totalExpenses.length && totalExpenses[0].total > budgetLimit.limit) {
      console.log('Sending budget limit notification...');
      await sendNotification(req.user.id, `You have exceeded your budget limit for ${category}.`);
    } else if (budgetLimit && totalExpenses.length && totalExpenses[0].total > (budgetLimit.limit * 0.9)) {
      console.log('Sending budget approaching notification...');
      await sendNotification(req.user.id, `You are close to exceeding your budget limit for ${category}.`);
    }

    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get expenses
router.get('/', auth, async (req, res) => {
  try {
    const { category, startDate, endDate, sortBy, order } = req.query;
    let filter = { user: req.user.id };

    if (category) {
      filter.category = category;
    }

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(filter).sort({ [sortBy || 'date']: order === 'desc' ? -1 : 1 });
    res.json(expenses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

