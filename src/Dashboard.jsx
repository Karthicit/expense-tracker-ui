import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { api } from './api';

// banknote hues; charts need real colour values, not CSS variables
const NOTE_COLORS = ['#2cc3d9', '#f2a516', '#9a8bd4', '#c2417f', '#a9b93a', '#8a5a44', '#8b9096'];
const INCOME = '#2f7d4f';
const EXPENSE = '#d1495b';
const AXIS = { fontSize: 12, fill: '#5b6b73' };

const thisMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7); // yyyy-MM
const money = (n) =>
  (n < 0 ? '-' : '') +
  '₹' +
  Math.abs(Number(n)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = (v) => (v >= 1000 ? `${v / 1000}k` : v);
const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'short' });
};

export default function Dashboard({ version }) {
  const [month, setMonth] = useState(thisMonth());
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // loads all five reports at once, whenever the month or `version` changes
  useEffect(() => {
    if (!month) return;
    Promise.all([
      api(`/api/reports/monthly?month=${month}`),
      api(`/api/reports/category-wise?month=${month}`),
      api('/api/reports/trend?months=6'),
      api(`/api/reports/daily?month=${month}`),
      api(`/api/reports/top-expenses?month=${month}&limit=5`),
    ])
      .then(([summary, categoryReport, trend, daily, top]) => {
        setData({ summary, categoryReport, trend, daily, top });
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [month, version]);

  const summary = data?.summary;
  const income = summary ? Number(summary.totalIncome) : 0;
  const expense = summary ? Number(summary.totalExpense) : 0;
  const savings = summary ? Number(summary.savings) : 0;
  const spentPct = income > 0 ? Math.min(100, (expense / income) * 100) : 0;

  let caption;
  if (income === 0 && expense === 0) {
    caption = 'Nothing logged for this month yet.';
  } else if (income === 0) {
    caption = 'No income logged for this month.';
  } else if (expense > income) {
    caption = 'You spent more than you earned this month.';
  } else {
    caption = `You spent ${spentPct.toFixed(1)}% of your income and kept ${(100 - spentPct).toFixed(1)}%.`;
  }

  const pieData = (data?.categoryReport.categories ?? []).map((c) => ({
    name: c.category,
    value: Number(c.total),
  }));
  const trendData = (data?.trend ?? []).map((t) => ({
    month: monthLabel(t.month),
    income: Number(t.income),
    expense: Number(t.expense),
  }));
  const dailyData = (data?.daily ?? []).map((d) => ({
    day: d.date.slice(8), // "2026-10-05" -> "05"
    amount: Number(d.amount),
  }));

  return (
    <div>
      <div className="page-head">
        <h1>Dashboard</h1>
        <div className="field">
          <label htmlFor="month">Month</label>
          <input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {!data && !error && <p className="empty">Loading your numbers...</p>}

      {summary && (
        <section className="hero">
          <p className="hero-label">Saved this month</p>
          <p className={`hero-figure${savings < 0 ? ' negative' : ''}`}>{money(savings)}</p>

          <ul className="hero-stats">
            <li>
              <span className="stat-label">Income</span>
              <span className="stat-value">{money(income)}</span>
            </li>
            <li>
              <span className="stat-label">Spent</span>
              <span className="stat-value">{money(expense)}</span>
            </li>
            <li>
              <span className="stat-label">Savings rate</span>
              <span className="stat-value">{summary.savingsRatePercent}%</span>
            </li>
          </ul>

          {income > 0 && (
            <div className="split-bar" role="img" aria-label={caption}>
              <div className="spent" style={{ width: `${spentPct}%` }} />
              <div className="saved" />
            </div>
          )}
          <p className="hero-caption">{caption}</p>
        </section>
      )}

      {data && (
        <div className="dash-grid">
          <section className="card span-2">
            <h3>Income and spending, last 6 months</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid vertical={false} stroke="#e5eae8" />
                  <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} tickFormatter={compact} />
                  <Tooltip formatter={(v) => money(v)} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="income" name="Income" fill={INCOME} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Spending" fill={EXPENSE} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card">
            <h3>Where it went</h3>
            {pieData.length === 0 ? (
              <p className="empty">No expenses this month.</p>
            ) : (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={NOTE_COLORS[i % NOTE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => money(v)} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="card span-3">
            <h3>Daily spending</h3>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid vertical={false} stroke="#e5eae8" />
                  <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} tickFormatter={compact} />
                  <Tooltip formatter={(v) => money(v)} labelFormatter={(d) => `Day ${d}`} />
                  <Line type="monotone" dataKey="amount" name="Spent" stroke="#0b8fa6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card span-3">
            <h3>Top 5 expenses</h3>
            {data.top.length === 0 ? (
              <p className="empty">No expenses this month.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Note</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.categoryName}</td>
                      <td>{t.description}</td>
                      <td className="num amount-expense">{money(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </div>
  );
}