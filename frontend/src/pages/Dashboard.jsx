import { useEffect, useState } from "react";
import api from "../api";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [budget, setBudget] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [dashboardResponse, budgetResponse] = await Promise.all([
        api.get(`/dashboard?month=${month}`),
        api.get(`/budgets?month=${month}`)
      ]);
      setData(dashboardResponse.data);
      setBudget(budgetResponse.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard.");
    }
  }

  useEffect(() => { loadData(); }, [month]);

  if (error) return <main className="container"><p className="error">{error}</p></main>;
  if (!data) return <main className="container"><p>Loading dashboard...</p></main>;

  const incomeVsExpenseTotal = data.income + data.expenses;
  const expensePercent = incomeVsExpenseTotal ? (data.expenses / incomeVsExpenseTotal) * 100 : 0;
  const budgetPercent = budget?.amount ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;

  return (
    <main className="container">
      <div className="page-heading">
        <div><h1>Dashboard</h1><p className="muted">A quick look at your finances.</p></div>
        <input className="month-input" type="month" value={month} onChange={e => setMonth(e.target.value)} />
      </div>

      <section className="summary-grid">
        <div className="summary-card balance"><p>Total Balance</p><h2>{money(data.balance)}</h2></div>
        <div className="summary-card income"><p>Total Income</p><h2>{money(data.income)}</h2></div>
        <div className="summary-card expense"><p>Total Expenses</p><h2>{money(data.expenses)}</h2></div>
      </section>

      <section className="panel">
        <h2>Monthly Spending Summary</h2>
        <p>Expenses for {month}: <strong>{money(data.monthlyExpenses)}</strong></p>
        <div className="progress-track"><div className="progress-fill purple" style={{ width: `${budgetPercent}%` }} /></div>
        <p className="muted">Budget used: {budgetPercent.toFixed(0)}%</p>
        {budget?.amount > 0 && data.monthlyExpenses >= budget.amount
          ? <p className="warning">You have reached or exceeded your budget.</p>
          : null}
      </section>

      <section className="panel">
        <h2>Income vs Expenses</h2>
        <div className="progress-track"><div className="progress-fill red" style={{ width: `${expensePercent}%` }} /></div>
        <p className="muted">Income: {money(data.income)} · Expenses: {money(data.expenses)}</p>
      </section>

      <section className="panel">
        <h2>Recent Transactions</h2>
        {data.recentTransactions.length === 0 ? <p className="muted">No transactions yet. Add your first one.</p> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Date</th><th>Amount</th></tr></thead>
            <tbody>{data.recentTransactions.map(item => (
              <tr key={item._id}>
                <td>{item.title}</td><td>{item.category}</td><td>{item.type}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td className={item.type === "Income" ? "green-text" : "red-text"}>{money(item.amount)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
