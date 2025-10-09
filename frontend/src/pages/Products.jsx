import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Products() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/products')
      .then(res => setItems(res.data?.data?.products ?? []))
      .catch(e => setErr(e.response?.data?.message || 'Error cargando productos'));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <header style={{ display:'flex', justifyContent:'space-between', marginBottom: 16 }}>
        <h2>Productos</h2>
        <div>
          {user ? <span style={{ marginRight: 8 }}>Hola, {user.firstName}</span> : null}
          <button onClick={logout}>Salir</button>
        </div>
      </header>

      {err && <p style={{ color:'crimson' }}>{err}</p>}
      <ul>
        {items.map(p => (
          <li key={p._id}>{p.name} — {p.sku}</li>
        ))}
      </ul>
    </div>
  );
}
