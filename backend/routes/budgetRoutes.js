const express = require("express");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budget = await Budget.findOne({ userId: req.userId, month });
    const [year, monthNumber] = month.split("-").map(Number);
    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 1);

    const expenses = await Transaction.find({
      userId: req.userId, type: "Expense", date: { $gte: start, $lt: end }
    });
    const spent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const amount = budget ? budget.amount : 0;

    res.json({ month, amount, spent, remaining: amount - spent });
  } catch (error) {
    res.status(500).json({ message: "Could not get budget" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { month, amount } = req.body;
    if (!/^\d{4}-\d{2}$/.test(month) || amount === undefined || Number(amount) < 0) {
      return res.status(400).json({ message: "Enter a valid month and budget amount" });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.userId, month },
      { amount: Number(amount) },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Could not save budget" });
  }
});

module.exports = router;
