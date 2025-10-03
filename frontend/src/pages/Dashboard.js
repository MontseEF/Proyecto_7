import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { data, isLoading, error, refetch } = useQuery(
    'dashboard',
    reportsService.getDashboard,
    {
      refetchInterval: 30000, // Actualizar cada 30 segundos
    }
  );

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Cargando dashboard..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Error al cargar el dashboard"
        onRetry={refetch}
      />
    );
  }

  const {
    todayStats,
    monthlyStats,
    inventory,
    topProducts,
    topCustomers,
    paymentMethodStats
  } = data.data;

  const statsCards = [
    {
      title: 'Ventas Hoy',
      value: todayStats.sales,
      subtitle: `$${todayStats.revenue.toLocaleString()}`,
      icon: ShoppingCartIcon,
      color: 'blue',
    },
    {
      title: 'Ventas del Mes',
      value: monthlyStats.sales,
      subtitle: `$${monthlyStats.revenue.toLocaleString()}`,
      icon: TrendingUpIcon,
      color: 'green',
    },
    {
      title: 'Stock Bajo',
      value: inventory.lowStockProducts,
      subtitle: 'Productos',
      icon: ExclamationTriangleIcon,
      color: 'yellow',
    },
    {
      title: 'Promedio Ticket',
      value: monthlyStats.sales > 0 ? `$${Math.round(monthlyStats.revenue / monthlyStats.sales).toLocaleString()}` : '$0',
      subtitle: 'Este mes',
      icon: CurrencyDollarIcon,
      color: 'purple',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color).split(' ');
          return (
            <div key={index} className="stats-card">
              <div className="stats-card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${colorClasses[2]} rounded-md flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${colorClasses[1]}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="ml-2 text-sm text-gray-600">
                          {stat.subtitle}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Productos Más Vendidos
            </h3>
            <p className="text-sm text-gray-500">Este mes</p>
          </div>
          <div className="card-body">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.totalQuantity} unidades
                      </p>
                      <p className="text-xs text-gray-500">
                        ${product.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay datos disponibles
              </p>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Mejores Clientes
            </h3>
            <p className="text-sm text-gray-500">Este mes</p>
          </div>
          <div className="card-body">
            {topCustomers.length > 0 ? (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <UsersIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${customer.totalSpent.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customer.totalPurchases} compras
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay datos disponibles
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {paymentMethodStats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Métodos de Pago
            </h3>
            <p className="text-sm text-gray-500">Últimos 7 días</p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethodStats.map((method, index) => {
                const methodNames = {
                  cash: 'Efectivo',
                  card: 'Tarjeta',
                  transfer: 'Transferencia',
                  credit: 'Crédito',
                  mixed: 'Mixto',
                };
                
                return (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {method.count}
                    </div>
                    <div className="text-sm text-gray-500">
                      {methodNames[method._id] || method._id}
                    </div>
                    <div className="text-xs text-gray-400">
                      ${method.total.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Acciones Rápidas
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="btn-primary text-center">
              Nueva Venta
            </button>
            <button className="btn-secondary text-center">
              Agregar Producto
            </button>
            <button className="btn-secondary text-center">
              Nuevo Cliente
            </button>
            <button className="btn-secondary text-center">
              Ver Inventario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;