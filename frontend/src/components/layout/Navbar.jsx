import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../image/logo.jpg';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b-2 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <img 
                className="h-10 w-auto rounded-md" 
                src={logo} 
                alt="Ferretería Zona Austral" 
              />
              <span className="ml-3 text-xl font-bold text-gray-800">
                Ferretería Zona Austral
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#dashboard" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Dashboard
            </a>
            <a 
              href="#productos" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Productos
            </a>
            <a 
              href="#ventas" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Ventas
            </a>
            <a 
              href="#clientes" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Clientes
            </a>
            <a 
              href="#inventario" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Inventario
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:block">
                  <span className="text-gray-700 text-sm">
                    Bienvenido, <span className="font-medium">{user.firstName}</span>
                  </span>
                  <span className="ml-2 badge badge-info">
                    {user.role === 'admin' ? 'Administrador' : 
                     user.role === 'cashier' ? 'Cajero' : 
                     user.role === 'employee' ? 'Empleado' : user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary text-sm"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          <a 
            href="#dashboard" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
          >
            Dashboard
          </a>
          <a 
            href="#productos" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
          >
            Productos
          </a>
          <a 
            href="#ventas" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
          >
            Ventas
          </a>
          <a 
            href="#clientes" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
          >
            Clientes
          </a>
          <a 
            href="#inventario" 
            className="block px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md text-base font-medium"
          >
            Inventario
          </a>
        </div>
      </div>
    </nav>
  );
}