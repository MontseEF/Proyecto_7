import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/logo.jpeg" 
                alt="Ferretería Zona Franca Logo" 
                className="h-16 w-auto rounded-md mb-4" 
              />
              <h2 className="text-2xl font-bold text-white mb-4">
                Ferretería Zona Franca
              </h2>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tu ferretería de confianza. Ofrecemos productos de calidad para 
              construcción, herramientas y todo lo que necesitas para tus proyectos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#productos" 
                  className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200"
                >
                  Catálogo de Productos
                </a>
              </li>
              <li>
                <a 
                  href="#servicios" 
                  className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200"
                >
                  Servicios
                </a>
              </li>
              <li>
                <a 
                  href="#contacto" 
                  className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200"
                >
                  Contacto
                </a>
              </li>
              <li>
                <a 
                  href="#ayuda" 
                  className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200"
                >
                  Centro de Ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              Información de Contacto
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Av. Principal 123, Santiago, Chile
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +56 2 2345 6789
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                info@ferreteriaaustral.cl
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Lun - Vie: 8:00 - 18:00, Sáb: 8:00 - 14:00
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {currentYear} Ferretería Zona Franca. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a 
              href="#privacy" 
              className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
            >
              Política de Privacidad
            </a>
            <a 
              href="#terms" 
              className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
            >
              Términos de Servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}