const express = require("express");
const Category = require("../models/Category");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Could not get categories" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !["Income", "Expense"].includes(type)) {
      return res.status(400).json({ message: "Category name and type are required" });
    }

    const category = await Category.create({
      userId: req.userId, name: name.trim(), type
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Category already exists" });
    res.status(500).json({ message: "Could not add category" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id, userId: req.userId
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete category" });
  }
});

module.exports = router;
