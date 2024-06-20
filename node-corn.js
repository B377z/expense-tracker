const cron = require('node-cron');
const RecurringTransaction = require('./models/RecurringTransaction');
const Expense = require('./models/Expense');

// Schedule task to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const recurringTransactions = await RecurringTransaction.find({ nextOccurrence: { $lte: now } });

    for (const rt of recurringTransactions) {
      const expense = new Expense({
        user: rt.user,
        amount: rt.amount,
        category: rt.category,
        description: rt.description,
        date: new Date(),
      });
      await expense.save();

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

    console.log('Processed recurring transactions');
  } catch (err) {
    console.error('Error processing recurring transactions:', err);
  }
});
