import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Test de Tailwind CSS</h1>
        <p className="text-gray-600 mb-6">Si puedes ver este texto con estilos, Tailwind funciona correctamente.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
          Botón de Prueba
        </button>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-red-500 h-20 rounded"></div>
          <div className="bg-green-500 h-20 rounded"></div>
          <div className="bg-yellow-500 h-20 rounded"></div>
        </div>
      </div>
    </div>
  );
}