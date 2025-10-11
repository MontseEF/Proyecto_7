import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;