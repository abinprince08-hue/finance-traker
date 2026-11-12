import { useEffect, useState } from "react";
import api from "../api";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Budget() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState({ amount: 0, spent: 0, remaining: 0 });
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("Expense");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [budgetResponse, categoryResponse] = await Promise.all([
        api.get(`/budgets?month=${month}`), api.get("/categories")
      ]);
      setBudget(budgetResponse.data);
      setAmount(budgetResponse.data.amount || "");
      setCategories(categoryResponse.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load budget and categories.");
    }
  }

  useEffect(() => { loadData(); }, [month]);

  async function saveBudget(event) {
    event.preventDefault();
    try {
      await api.post("/budgets", { month, amount: Number(amount) });
      setMessage("Monthly budget saved.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save budget.");
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    try {
      await api.post("/categories", { name: categoryName, type: categoryType });
      setCategoryName("");
      setMessage("Category added.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add category.");
    }
  }

  async function deleteCategory(id) {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setMessage("Category deleted.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete category.");
    }
  }

  const percent = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;

  return (
    <main className="container">
      <div className="page-heading">
        <div><h1>Budget & Categories</h1><p className="muted">Plan a monthly budget and manage categories.</p></div>
        <input className="month-input" type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </div>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>Monthly Budget</h2>
        <form className="inline-form" onSubmit={saveBudget}>
          <label>Budget amount (₹)
            <input type="number" min="0" step="0.01" value={amount}
              onChange={e => setAmount(e.target.value)} required />
          </label>
          <button>Save Budget</button>
        </form>
        <div className="budget-details">
          <p>Budget: <strong>{money(budget.amount)}</strong></p>
          <p>Spent: <strong>{money(budget.spent)}</strong></p>
          <p>Remaining: <strong>{money(budget.remaining)}</strong></p>
        </div>
        <div className="progress-track"><div className={`progress-fill ${percent >= 100 ? "red" : "purple"}`}
          style={{ width: `${percent}%` }} /></div>
        <p className="muted">{percent.toFixed(0)}% of budget used</p>
        {budget.amount > 0 && percent >= 80 && <p className="warning">
          {percent >= 100 ? "You have exceeded your budget!" : "You are getting close to your budget."}
        </p>}
      </section>

      <section className="panel">
        <h2>Manage Categories</h2>
        <form className="inline-form" onSubmit={addCategory}>
          <label>Category name
            <input value={categoryName} onChange={e => setCategoryName(e.target.value)} required />
          </label>
          <label>Type
            <select value={categoryType} onChange={e => setCategoryType(e.target.value)}>
              <option>Expense</option><option>Income</option>
            </select>
          </label>
          <button>Add Category</button>
        </form>
        {categories.length === 0 ? <p className="muted">No categories added yet.</p> : (
          <ul className="category-list">
            {categories.map(item => <li key={item._id}>
              <span>{item.name} <small>({item.type})</small></span>
              <button className="small-button danger-button" onClick={() => deleteCategory(item._id)}>Delete</button>
            </li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
