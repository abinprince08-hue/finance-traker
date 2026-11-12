import { useEffect, useState } from "react";

const today = new Date().toISOString().slice(0, 10);

export default function TransactionForm({ initialData, categories, onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount);
      setType(initialData.type);
      setCategory(initialData.category);
      setDate(new Date(initialData.date).toISOString().slice(0, 10));
    } else {
      setTitle("");
      setAmount("");
      setType("Expense");
      setCategory("Other");
      setDate(today);
    }
  }, [initialData]);

  const filteredCategories = categories.filter(item => item.type === type);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim() || Number(amount) <= 0 || !category || !date) {
      alert("Please fill in all fields with valid values.");
      return;
    }
    await onSave({ title, amount: Number(amount), type, category, date });
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>{initialData ? "Edit Transaction" : "Add Transaction"}</h2>
      <label>Title / Description</label>
      <input value={title} onChange={e => setTitle(e.target.value)} required />
      <label>Amount (₹)</label>
      <input type="number" min="0.01" step="0.01" value={amount}
        onChange={e => setAmount(e.target.value)} required />
      <label>Type</label>
      <select value={type} onChange={e => {
        setType(e.target.value);
        setCategory("Other");
      }}>
        <option>Expense</option>
        <option>Income</option>
      </select>
      <label>Category</label>
      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="Other">Other</option>
        {filteredCategories.map(item => <option key={item._id} value={item.name}>{item.name}</option>)}
      </select>
      <label>Date</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      <div className="form-buttons">
        <button type="submit">{initialData ? "Update" : "Add"} Transaction</button>
        {onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
