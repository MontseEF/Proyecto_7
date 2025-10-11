import React from 'react';
import { Routes, Route, createBrowserRouter, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import RecoverAccount from './pages/RecoverAccount';
import TestPage from './pages/TestPage';
import OrderHistory from './pages/OrderHistory';
import PrivateRoute from "./components/common/PrivateRoute";


function Router() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/recuperar-cuenta" element={<RecoverAccount />} />
    </Routes>
  );
}

export default Router;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/test",
    element: <TestPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/orders",
    element: <OrderHistory />,
  },
  {
    path: "/app/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard/>
      </PrivateRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});