import React from 'react';

export default function DataCard({ title, data, onClick, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-300',
    green: 'border-green-200 hover:border-green-300',
    yellow: 'border-yellow-200 hover:border-yellow-300',
    red: 'border-red-200 hover:border-red-300',
    purple: 'border-purple-200 hover:border-purple-300'
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    purple: 'text-purple-500'
  };

  const borderClass = colorClasses[color] || colorClasses.blue;
  const iconColorClass = iconColorClasses[color] || iconColorClasses.blue;

  return (
    <div 
      className={`card hover:shadow-lg transition-all duration-300 cursor-pointer ${borderClass}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="flex items-center">
          {icon && (
            <div className={`mr-3 ${iconColorClass}`}>
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
      </div>
      <div className="card-body">
        {Array.isArray(data) && data.length > 0 ? (
          <div className="space-y-3">
            {data.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name || item.title || item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="ml-2 flex-shrink-0">
                  {item.value && (
                    <span className="text-sm font-semibold text-gray-900">
                      {typeof item.value === 'number' && item.value > 1000 
                        ? `$${item.value.toLocaleString()}`
                        : item.value
                      }
                    </span>
                  )}
                  {item.quantity && (
                    <span className="text-sm text-gray-500 ml-1">
                      ({item.quantity})
                    </span>
                  )}
                </div>
              </div>
            ))}
            {data.length > 3 && (
              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">
                  +{data.length - 3} más...
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              No hay datos disponibles
            </p>
          </div>
        )}
      </div>
      <div className="px-6 py-3 bg-gray-50 text-right">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          Ver todos →
        </button>
      </div>
    </div>
  );
}