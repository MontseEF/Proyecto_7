import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  CubeIcon,
  TagIcon,
  UsersIcon,
  TruckIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['admin', 'employee', 'cashier'],
    },
    {
      name: 'Productos',
      href: '/products',
      icon: CubeIcon,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Categorías',
      href: '/categories',
      icon: TagIcon,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Clientes',
      href: '/customers',
      icon: UsersIcon,
      roles: ['admin', 'employee', 'cashier'],
    },
    {
      name: 'Proveedores',
      href: '/suppliers',
      icon: TruckIcon,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Ventas',
      href: '/sales',
      icon: ShoppingCartIcon,
      roles: ['admin', 'employee', 'cashier'],
    },
    {
      name: 'Inventario',
      href: '/inventory',
      icon: ClipboardDocumentListIcon,
      roles: ['admin', 'employee'],
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: ChartBarIcon,
      roles: ['admin', 'employee'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Ferretería</h1>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="h-8 w-8 text-gray-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName || `${user?.firstName} ${user?.lastName}`}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-2 border-t border-gray-200">
        <Link
          to="/profile"
          className="sidebar-link"
          onClick={() => setIsMobileOpen(false)}
        >
          <Cog6ToothIcon className="mr-3 h-5 w-5" />
          Configuración
        </Link>
        <button
          onClick={handleLogout}
          className="w-full sidebar-link text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative flex flex-col w-64 h-full bg-white shadow-xl">
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;