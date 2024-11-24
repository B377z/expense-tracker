// models/BudgetLimit.js
const mongoose = require('mongoose');

const BudgetLimitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
});

module.exports = mongoose.model('BudgetLimit', BudgetLimitSchema);