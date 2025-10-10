import React, { createContext, useContext, useMemo, useState } from "react";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // {productId, name, price, quantity, image}

  function add(product, quantity = 1) {
    const price = product.price || 0;
    setItems((prev) => {
      const existingItem = prev.find(x => x.productId === product._id);
      if (existingItem) {
        return prev.map(x => 
          x.productId === product._id 
            ? { ...x, quantity: x.quantity + quantity } 
            : x
        );
      }
      return [...prev, { 
        productId: product._id,
        name: product.name,
        price: price,
        quantity: quantity,
        image: product.image || null
      }];
    });
  }

  function remove(productId) { 
    setItems(prev => prev.filter(x => x.productId !== productId)); 
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      remove(productId);
      return;
    }
    setItems(prev => 
      prev.map(x => 
        x.productId === productId 
          ? { ...x, quantity } 
          : x
      )
    );
  }

  function clear() { setItems([]); }

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (item.quantity * item.price), 0), 
    [items]
  );

  const itemCount = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
    [items]
  );

  return (
    <CartCtx.Provider value={{ 
      items, 
      add, 
      remove, 
      updateQuantity, 
      clear, 
      total, 
      itemCount 
    }}>
      {children}
    </CartCtx.Provider>
  );
}
