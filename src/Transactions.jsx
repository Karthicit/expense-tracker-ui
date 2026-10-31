import { useEffect, useState } from 'react';
import { api } from './api';

const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd in your local time
const money = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Transactions({ categories, onChange }) {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE',
    description: '',
    date: today(),
    categoryId: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function load() {
    return api('/api/transactions').then(setTransactions);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function add(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    try {
      await api('/api/transactions', {
        method: 'POST',
        body: {
          amount: form.amount === '' ? null : Number(form.amount),
          type: form.type,
          description: form.description,
          date: form.date,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
        },
      });
      setForm({ ...form, amount: '', description: '' });
      await load();
      onChange();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fieldErrors || {});
    }
  }

  async function remove(id) {
    setError('');
    try {
      await api(`/api/transactions/${id}`, { method: 'DELETE' });
      await load();
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div className="stack">
      <h1>Transactions</h1>

      <section className="card">
        <h2>Add a transaction</h2>
        <form onSubmit={add}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" value={form.type} onChange={update}>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
              {fieldErrors.type && <span className="field-error">{fieldErrors.type}</span>}
            </div>

            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={update}
              />
              {fieldErrors.amount && <span className="field-error">{fieldErrors.amount}</span>}
            </div>

            <div className="field">
              <label htmlFor="categoryId">Category</label>
              <select id="categoryId" name="categoryId" value={form.categoryId} onChange={update}>
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && (
                <span className="field-error">{fieldErrors.categoryId}</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" name="date" type="date" value={form.date} onChange={update} />
              {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
            </div>

            <div className="field">
              <label htmlFor="description">Note</label>
              <input
                id="description"
                name="description"
                placeholder="Optional"
                value={form.description}
                onChange={update}
              />
              {fieldErrors.description && (
                <span className="field-error">{fieldErrors.description}</span>
              )}
            </div>
          </div>

          {error && !hasFieldErrors && <p className="error">{error}</p>}
          <div style={{ marginTop: 16 }}>
            <button type="submit">Add transaction</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>History</h2>
        {transactions.length === 0 ? (
          <p className="empty">No transactions yet. Add your first one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th className="num">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.categoryName}</td>
                  <td>{t.description}</td>
                  <td className={`num ${t.type === 'INCOME' ? 'amount-income' : 'amount-expense'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}
                    {money(t.amount)}
                  </td>
                  <td className="num">
                    <button className="danger" onClick={() => remove(t.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}