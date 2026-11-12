import { useEffect, useState } from "react";
import api from "../api";
import TransactionForm from "../components/TransactionForm";

function money(value) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [transactionResponse, categoryResponse] = await Promise.all([
        api.get("/transactions"), api.get("/categories")
      ]);
      setTransactions(transactionResponse.data);
      setCategories(categoryResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load transactions.");
    }
  }

  useEffect(() => { loadData(); }, []);

  async function saveTransaction(formData) {
    try {
      if (editing) await api.put(`/transactions/${editing._id}`, formData);
      else await api.post("/transactions", formData);
      setShowForm(false);
      setEditing(null);
      setMessage("Transaction saved successfully.");
      setError("");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save transaction.");
    }
  }

  async function deleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setMessage("Transaction deleted.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete transaction.");
    }
  }

  const filtered = transactions.filter(item =>
    (!typeFilter || item.type === typeFilter) &&
    (!categoryFilter || item.category === categoryFilter)
  );

  return (
    <main className="container">
      <div className="page-heading">
        <div><h1>Transactions</h1><p className="muted">Add and manage your money records.</p></div>
        <button onClick={() => { setEditing(null); setShowForm(!showForm); }}>
          {showForm ? "Close Form" : "+ Add Transaction"}
        </button>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      {showForm && <TransactionForm initialData={editing} categories={categories}
        onSave={saveTransaction} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      <section className="panel">
        <div className="filters">
          <label>Type
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option><option>Income</option><option>Expense</option>
            </select>
          </label>
          <label>Category
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {[...new Set(transactions.map(item => item.category))].sort().map(name =>
                <option key={name}>{name}</option>
              )}
            </select>
          </label>
        </div>
        {filtered.length === 0 ? <p className="muted">No transactions found.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Title</th><th>Amount</th><th>Type</th><th>Category</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map(item => (
              <tr key={item._id}>
                <td>{item.title}</td><td>{money(item.amount)}</td><td>{item.type}</td>
                <td>{item.category}</td><td>{new Date(item.date).toLocaleDateString()}</td>
                <td className="actions">
                  <button className="small-button" onClick={() => { setEditing(item); setShowForm(true); }}>Edit</button>
                  <button className="small-button danger-button" onClick={() => deleteTransaction(item._id)}>Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
