// routes/recurringTransactions.js
const express = require('express');
const mongoose = require('mongoose');
const RecurringTransaction = require('../models/RecurringTransaction');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

const router = express.Router();

// Add a recurring transaction
router.post('/', auth, async (req, res) => {
  const { amount, category, description, frequency, nextOccurrence } = req.body;
  try {
    const recurringTransaction = new RecurringTransaction({
      user: req.user.id,
      amount,
      category,
      description,
      frequency,
      nextOccurrence: new Date(nextOccurrence),
    });
    await recurringTransaction.save();
    res.json(recurringTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a recurring transaction
router.put('/:id', auth, async (req, res) => {
  const { amount, category, description, frequency, nextOccurrence } = req.body;
  try {
    const recurringTransaction = await RecurringTransaction.findByIdAndUpdate(
      req.params.id,
      {
        amount,
        category,
        description,
        frequency,
        nextOccurrence: new Date(nextOccurrence),
      },
      { new: true }
    );
    res.json(recurringTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all recurring transactions
router.get('/', auth, async (req, res) => {
  try {
    const recurringTransactions = await RecurringTransaction.find({ user: req.user.id });
    res.json(recurringTransactions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a recurring transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    await RecurringTransaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recurring transaction deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Process recurring transactions
router.post('/process', async (req, res) => {
  try {
    const now = new Date();
    const recurringTransactions = await RecurringTransaction.find({ nextOccurrence: { $lte: now } });
    
    const expenses = [];
    for (const rt of recurringTransactions) {
      const expense = new Expense({
        user: rt.user,
        amount: rt.amount,
        category: rt.category,
        description: rt.description,
        date: new Date(),
      });
      await expense.save();
      expenses.push(expense);

      // Update the next occurrence based on the frequency
      let nextOccurrence = new Date(rt.nextOccurrence);
      switch (rt.frequency) {
        case 'daily':
          nextOccurrence.setDate(nextOccurrence.getDate() + 1);
          break;
        case 'weekly':
          nextOccurrence.setDate(nextOccurrence.getDate() + 7);
          break;
        case 'monthly':
          nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
          break;
        case 'yearly':
          nextOccurrence.setFullYear(nextOccurrence.getFullYear() + 1);
          break;
      }
      rt.nextOccurrence = nextOccurrence;
      await rt.save();
    }

    res.json(expenses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
