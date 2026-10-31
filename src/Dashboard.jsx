import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
} from 'recharts';
import { api } from './api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#84cc16'];
const thisMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7); // yyyy-MM
const money = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Panel({ title, children }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function Kpi({ label, value, color }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 12, padding: '12px 16px' }}>
      <small>{label}</small>
      <div style={{ fontSize: 22, fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

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
  const pieData = (data?.categoryReport.categories ?? []).map((c) => ({
    name: c.category,
    value: Number(c.total),
  }));
  const dailyData = (data?.daily ?? []).map((d) => ({
    day: d.date.slice(8), // "2026-10-05" -> "05"
    amount: Number(d.amount),
  }));

  return (
    <section>
      <h2>Dashboard</h2>
      <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {summary && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
            margin: '16px 0',
          }}
        >
          <Kpi label="Income" value={money(summary.totalIncome)} color="#22c55e" />
          <Kpi label="Expenses" value={money(summary.totalExpense)} color="#ef4444" />
          <Kpi
            label="Savings"
            value={money(summary.savings)}
            color={Number(summary.savings) < 0 ? '#ef4444' : '#22c55e'}
          />
          <Kpi label="Savings rate" value={`${summary.savingsRatePercent}%`} />
        </div>
      )}

      {data && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          <Panel title="Spending by category">
            {pieData.length === 0 ? (
              <p>No expenses this month.</p>
            ) : (
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => money(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel title="Income vs expenses (last 6 months)">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend.map((t) => ({
                  month: t.month,
                  income: Number(t.income),
                  expense: Number(t.expense),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" />
                  <Bar dataKey="expense" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Daily spending">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(v) => money(v)} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Top 5 expenses">
            {data.top.length === 0 ? (
              <p>No expenses this month.</p>
            ) : (
              <table style={{ width: '100%' }}>
                <tbody>
                  {data.top.map((t) => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.categoryName}</td>
                      <td>{t.description}</td>
                      <td style={{ textAlign: 'right' }}>{money(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}
    </section>
  );
}