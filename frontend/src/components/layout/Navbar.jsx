import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bars3Icon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md px-4 py-3 flex items-center justify-between md:justify-start">
      {/* Botón hamburguesa para móviles */}
      <button
        className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={onToggleSidebar}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Título o logo */}
      <h1 className="text-xl font-bold text-gray-800 ml-4">Ferretería Zona Franca</h1>

      {/* Acciones del usuario */}
      <div className="ml-auto flex items-center space-x-4">
        {/* Ícono del carrito */}
        <button
          onClick={() => navigate('/cart')}
          className="relative text-gray-600 hover:text-gray-900"
        >
          <ShoppingCartIcon className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              {itemCount}
            </span>
          )}
        </button>

        {/* Usuario y logout */}
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
            >
              Crear cuenta
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-500 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
