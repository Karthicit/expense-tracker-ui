import { useNavigate } from 'react-router-dom';
import { clearToken } from './api';
import Categories from './Categories';

export default function Home() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate('/login');
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Expense Tracker</h1>
      <button onClick={logout}>Log out</button>
      <Categories />
    </div>
  );
}