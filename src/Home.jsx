import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from './api';
import Categories from './Categories';
import Transactions from './Transactions';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

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
    <div style={{ padding: 24 }}>
      <h1>Expense Tracker</h1>
      <button onClick={logout}>Log out</button>
      <Categories categories={categories} setCategories={setCategories} />
      <Transactions categories={categories} />
    </div>
  );
}