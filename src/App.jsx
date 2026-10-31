import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Home from './Home';
import { getToken } from './api';

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route path="/" element={<Protected><Home /></Protected>} />
    </Routes>
  );
}