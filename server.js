// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const notificationRoutes = require('./routes/notification');
const summaryRoutes = require('./routes/summary');
const budgetLimitRoutes = require('./routes/budgetLimits');
const recurringTransactionRoutes = require('./routes/recurringTransactions');

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/budgetLimits', budgetLimitRoutes);
app.use('/api/recurringTransactions', recurringTransactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
