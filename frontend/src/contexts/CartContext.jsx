import { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // {product, qty, price}

  function add(product, qty = 1, price = product.pricing?.sellingPrice ?? 0) {
    setItems((prev) => {
      const i = prev.find(x => x.product._id === product._id);
      if (i) return prev.map(x => x.product._id === product._id ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { product, qty, price }];
    });
  }

  function remove(id) { setItems(prev => prev.filter(x => x.product._id !== id)); }
  function clear() { setItems([]); }

  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, add, remove, clear, total }}>
      {children}
    </CartCtx.Provider>
  );
}
