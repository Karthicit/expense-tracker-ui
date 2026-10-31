import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from './api';
import Categories from './Categories';
import Dashboard from './Dashboard';
import Transactions from './Transactions';

const VIEWS = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'categories', label: 'Categories' },
  { id: 'dashboard', label: 'Dashboard' },
];

export default function Home() {
  const navigate = useNavigate();
  const [view, setView] = useState('transactions');
  const [categories, setCategories] = useState([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    api('/api/categories')
      .then(setCategories)
      .catch((e) => console.error(e));
  }, []);

  function logout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Expense Tracker</div>
        {VIEWS.map((v) => (
          <button
            key={v.id}
            className={`nav-item${view === v.id ? ' active' : ''}`}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
        <button className="nav-item logout" onClick={logout}>
          Log out
        </button>
      </aside>

      <main className="main">
        {view === 'transactions' && (
          <Transactions categories={categories} onChange={() => setVersion((v) => v + 1)} />
        )}
        {view === 'categories' && (
          <Categories categories={categories} setCategories={setCategories} />
        )}
        {view === 'dashboard' && <Dashboard version={version} />}
      </main>
    </div>
  );
}