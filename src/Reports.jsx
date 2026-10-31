import { useEffect, useState } from 'react';
import { api } from './api';

const thisMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7); // yyyy-MM
const money = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Card({ label, value, color }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: '8px 16px', minWidth: 120 }}>
      <small>{label}</small>
      <div style={{ fontSize: 20, fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

export default function Reports({ version }) {
  const [month, setMonth] = useState(thisMonth());
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState(null);
  const [error, setError] = useState('');

  // runs on first load, and again whenever the month or `version` changes
  useEffect(() => {
    if (!month) return;
    Promise.all([
      api(`/api/reports/monthly?month=${month}`),
      api(`/api/reports/category-wise?month=${month}`),
    ])
      .then(([s, c]) => {
        setSummary(s);
        setByCategory(c);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [month, version]);

  return (
    <section>
      <h2>Monthly report</h2>
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {summary && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '16px 0' }}>
          <Card label="Income" value={money(summary.totalIncome)} color="green" />
          <Card label="Expenses" value={money(summary.totalExpense)} color="crimson" />
          <Card
            label="Savings"
            value={money(summary.savings)}
            color={Number(summary.savings) < 0 ? 'crimson' : 'green'}
          />
          <Card label="Savings rate" value={`${summary.savingsRatePercent}%`} />
        </div>
      )}

      <h3>Where the money went</h3>
      {byCategory && byCategory.categories.length === 0 && <p>No expenses this month.</p>}
      {byCategory &&
        byCategory.categories.map((c) => (
          <div key={c.category} style={{ margin: '8px 0' }}>
            <div>
              {c.category}: {money(c.total)} ({c.percentage}%)
            </div>
            <div style={{ background: '#ddd', borderRadius: 4, height: 10 }}>
              <div
                style={{ width: `${c.percentage}%`, background: 'crimson', height: 10, borderRadius: 4 }}
              />
            </div>
          </div>
        ))}
    </section>
  );
}