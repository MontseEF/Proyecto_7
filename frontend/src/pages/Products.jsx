import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Products() {
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/products", { params: { search: q } });
      setItems(data?.data?.products ?? []);
    })();
  }, [q]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Productos</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={logout}>Salir</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {items.map(p => (
          <article key={p._id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <img src={p.images?.find(i=>i.isPrimary)?.url ?? "/placeholder.png"} alt={p.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />
            <h4 style={{ margin: "8px 0" }}>{p.name}</h4>
            <div style={{ fontWeight: 700 }}>${p.pricing?.sellingPrice?.toLocaleString?.() ?? "-"}</div>
            <small>SKU: {p.sku}</small>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => alert("Añadido al carrito (demo)")}>Agregar</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
