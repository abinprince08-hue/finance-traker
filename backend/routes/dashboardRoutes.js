const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    const income = transactions.filter(item => item.type === "Income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = transactions.filter(item => item.type === "Expense")
      .reduce((sum, item) => sum + item.amount, 0);

    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, monthNumber] = month.split("-").map(Number);
    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 1);
    const monthlyTransactions = transactions.filter(item =>
      item.date >= start && item.date < end && item.type === "Expense"
    );
    const monthlyExpenses = monthlyTransactions.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      income, expenses, balance: income - expenses,
      monthlyExpenses, recentTransactions: transactions.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load dashboard" });
  }
});

module.exports = router;
