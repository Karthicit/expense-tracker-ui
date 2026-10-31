import { useEffect, useState } from 'react';
import { api } from './api';

const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd in your local time

export default function Transactions({ categories , onChange }) {
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
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h2>Transactions</h2>
      <form onSubmit={add}>
        <select name="type" value={form.type} onChange={update}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={update}
        />
        <select name="categoryId" value={form.categoryId} onChange={update}>
          <option value="">Category...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="date" type="date" value={form.date} onChange={update} />
        <input
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={update}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {Object.values(fieldErrors).map((msg) => (
        <div key={msg} style={{ color: 'crimson' }}>{msg}</div>
      ))}

      <table>
        <thead>
          <tr>
            <th>Date</th><th>Category</th><th>Type</th><th>Description</th><th>Amount</th><th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>{t.categoryName}</td>
              <td>{t.type}</td>
              <td>{t.description}</td>
              <td style={{ color: t.type === 'INCOME' ? 'green' : 'crimson' }}>
                {t.type === 'INCOME' ? '+' : '-'}{t.amount}
              </td>
              <td><button onClick={() => remove(t.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}