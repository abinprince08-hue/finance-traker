const express = require("express");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const filter = { userId: req.userId };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Could not get transactions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    if (!title || amount === undefined || !type || !category || !date) {
      return res.status(400).json({ message: "Please fill in all transaction fields" });
    }
    if (Number(amount) <= 0 || !["Income", "Expense"].includes(type)) {
      return res.status(400).json({ message: "Enter a valid amount and type" });
    }

    const transaction = await Transaction.create({
      userId: req.userId, title: title.trim(), amount: Number(amount),
      type, category: category.trim(), date
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Could not add transaction" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;
    if (!title || amount === undefined || !type || !category || !date || Number(amount) <= 0) {
      return res.status(400).json({ message: "Please enter valid transaction details" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title: title.trim(), amount: Number(amount), type, category: category.trim(), date },
      { new: true, runValidators: true }
    );

    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Could not update transaction" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id, userId: req.userId
    });
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete transaction" });
  }
});

module.exports = router;
