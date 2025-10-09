import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('admin@ferreteria.com');
  const [password, setPassword] = useState('admin123');
  const [msg, setMsg] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const r = await login(username, password);
    if (r.ok) nav('/');
    else setMsg(r.message);
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Usuario o email
          <input value={username} onChange={e=>setUsername(e.target.value)} required />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
        <button disabled={loading} type="submit">
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
    </div>
  );
}
