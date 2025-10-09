import { Navigate, createBrowserRouter } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Cargando...</div>;
  return token ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/products",
    element: (
      <PrivateRoute>
        <Products />
      </PrivateRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
