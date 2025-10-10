import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import CheckoutForm from './CheckoutForm';

const Cart = ({ isOpen, onClose }) => {
  const { items, remove, updateQuantity, clear, total, itemCount } = useCart();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, parseInt(newQuantity));
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Debes iniciar sesión para realizar una compra');
      return;
    }
    setShowCheckout(true);
  };

  if (showCheckout) {
    return (
      <CheckoutForm 
        isOpen={true}
        onClose={() => {
          setShowCheckout(false);
          onClose();
        }}
        items={items}
        total={total}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Carrito ({itemCount})</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex-1">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center space-x-4 border-b pb-4">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price?.toLocaleString()}</p>
                    <div className="flex items-center mt-2">
                      <label className="text-sm text-gray-500 mr-2">Cantidad:</label>
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => remove(item.productId)}
                      className="text-red-500 text-sm mt-2 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between text-xl font-bold mb-4">
              <span>Total: ${total.toLocaleString()}</span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                {user ? 'Proceder al Pago' : 'Inicia Sesión para Comprar'}
              </button>
              
              <button
                onClick={clear}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Vaciar Carrito
              </button>
            </div>

            {!user && (
              <p className="text-sm text-gray-600 text-center mt-2">
                Necesitas una cuenta para realizar compras
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;