import { useState } from 'react';
import { api } from './api';

export default function Categories({ categories, setCategories }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      const created = await api('/api/categories', { method: 'POST', body: { name } });
      setCategories([...categories, created]);
      setName('');
    } catch (err) {
      setError(err.fieldErrors?.name || err.message);
    }
  }

  async function remove(id) {
    setError('');
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE' });
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="stack">
      <h1>Categories</h1>

      <section className="card">
        <h2>Add a category</h2>
        <form onSubmit={add} className="inline-form">
          <div className="field grow">
            <label htmlFor="category-name">Name</label>
            <input
              id="category-name"
              placeholder="For example Food or Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit">Add category</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>Your categories</h2>
        {categories.length === 0 ? (
          <p className="empty">No categories yet. Add one above, then use it in a transaction.</p>
        ) : (
          <div className="chip-list">
            {categories.map((c) => (
              <span className="chip" key={c.id}>
                {c.name}
                <button
                  className="danger"
                  onClick={() => remove(c.id)}
                  aria-label={`Delete ${c.name}`}
                >
                  Delete
                </button>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}