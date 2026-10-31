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
    <section>
      <h2>Categories</h2>
      <form onSubmit={add}>
        <input
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            {c.name} <button onClick={() => remove(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}