// models/RecurringTransaction.js
const mongoose = require('mongoose');

const RecurringTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
  nextOccurrence: { type: Date, required: true },
});

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);
