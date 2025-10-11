import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar superior */}
      <Navbar onToggleSidebar={toggleSidebar} />

      {/* Contenido principal con Sidebar y vista */}
      <div className="flex flex-1">
        {/* Sidebar lateral (oculto en móviles) */}
        <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block`}>
          <Sidebar onClose={toggleSidebar} />
        </div>

        {/* Área de contenido */}
        <main className="flex-1 p-6 ml-0 md:ml-64 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer inferior */}
      <Footer />
    </div>
  );
};

export default Layout;