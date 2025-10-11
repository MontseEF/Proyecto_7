import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Modal from '../components/common/Modal';
import { api } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      // Obtener productos públicos (sin autenticación)
      const productsResponse = await api.get('/products');
      setProducts(productsResponse.data?.data?.products || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-blue-600 text-white rounded p-2 mr-3">
                <BuildingStorefrontIcon className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-gray-800">Ferretería Monserrat</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('inicio')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Inicio
              </button>
              <button 
                onClick={() => scrollToSection('servicios')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Servicios
              </button>
              <button 
                onClick={() => scrollToSection('productos')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Productos
              </button>
              <button 
                onClick={() => scrollToSection('contacto')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contacto
              </button>
              <button 
                onClick={goToLogin}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                >
                  Inicio
                </button>
                <button
                  onClick={() => scrollToSection('servicios')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                >
                  Servicios
                </button>
                <button
                  onClick={() => scrollToSection('productos')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                >
                  Productos
                </button>
                <button
                  onClick={() => scrollToSection('contacto')}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                >
                  Contacto
                </button>
                <button
                  onClick={goToLogin}
                  className="block w-full text-left px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div id="inicio" className="bg-blue-600 text-white pt-16">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a Ferretería Monserrat
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Tu ferretería de confianza con más de 20 años sirviendo a la comunidad. 
              Herramientas, materiales de construcción y todo lo que necesitas para tus proyectos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => scrollToSection('productos')}
                className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400"
              >
                Ver Catálogo
              </button>
              <button 
                onClick={goToLogin}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
              >
                Sistema de Gestión
              </button>
            </div>
          </div>
        </div>
      </div>

              {/* Hero Image/Graphic */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl opacity-20 transform rotate-6"></div>
                  <div className="relative bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-center">
                        <WrenchScrewdriverIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h3 className="font-semibold">Herramientas</h3>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-center">
                        <BuildingStorefrontIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h3 className="font-semibold">Materiales</h3>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-center">
                        <TruckIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h3 className="font-semibold">Delivery</h3>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-center">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h3 className="font-semibold">Calidad</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Separator */}
        <div className="relative">
          <svg className="w-full h-24 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50" id="servicios">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">¿Por qué elegirnos?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nos destacamos por nuestro compromiso con la calidad, servicio personalizado y años de experiencia en el sector
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center text-gray-900">Calidad Garantizada</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Productos de las mejores marcas con garantía completa. Trabajamos solo con proveedores confiables y certificados.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <ClockIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center text-gray-900">Atención Rápida</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Servicio eficiente y personalizado para cada cliente. Nuestro equipo experto te ayuda a encontrar lo que necesitas.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 md:col-span-2 lg:col-span-1">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <MapPinIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-center text-gray-900">Ubicación Céntrica</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Fácil acceso y amplio estacionamiento disponible. Ubicados estratégicamente para servir mejor a nuestros clientes.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">20+</div>
                <div className="text-gray-600 font-medium">Años de Experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
                <div className="text-gray-600 font-medium">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">10000+</div>
                <div className="text-gray-600 font-medium">Clientes Satisfechos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Soporte</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-20 bg-white" id="productos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Nuestros Productos Destacados</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre algunos de nuestros productos más populares con la mejor calidad y precios competitivos
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map((product) => (
                <div 
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
                  onClick={() => openProductModal(product)}
                >
                  <div className="relative">
                    <div className="flex items-center justify-center h-56 bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
                      <WrenchScrewdriverIcon className="w-20 h-20 text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Stock: {product.inventory?.currentStock || 0}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-3xl font-bold text-blue-600">
                        ${product.pricing?.sellingPrice?.toLocaleString()}
                      </span>
                      {product.inventory?.currentStock > 0 ? (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Disponible
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                          Agotado
                        </span>
                      )}
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">¿Necesitas más productos?</h3>
              <p className="text-blue-100 mb-6 text-lg">
                Accede a nuestro catálogo completo con más de 5,000 productos para todos tus proyectos
              </p>
              <button 
                onClick={goToLogin}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                Ver Catálogo Completo - Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white" id="contacto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Visítanos o Contáctanos</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Estamos aquí para ayudarte con tus proyectos. Nuestro equipo de expertos te espera
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-3xl font-semibold mb-8 text-center lg:text-left">Información de Contacto</h3>
              <div className="space-y-6">
                <div className="flex items-center group">
                  <div className="bg-blue-500 bg-opacity-20 rounded-xl p-3 mr-4 group-hover:bg-opacity-30 transition-all duration-300">
                    <MapPinIcon className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-100">Dirección</p>
                    <p className="text-white">Av. Principal 123, Santiago, Chile</p>
                  </div>
                </div>
                <div className="flex items-center group">
                  <div className="bg-green-500 bg-opacity-20 rounded-xl p-3 mr-4 group-hover:bg-opacity-30 transition-all duration-300">
                    <PhoneIcon className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-100">Teléfono</p>
                    <p className="text-white">+56 2 2345 6789</p>
                  </div>
                </div>
                <div className="flex items-center group">
                  <div className="bg-yellow-500 bg-opacity-20 rounded-xl p-3 mr-4 group-hover:bg-opacity-30 transition-all duration-300">
                    <EnvelopeIcon className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-100">Email</p>
                    <p className="text-white">info@ferreteriamonserrat.cl</p>
                  </div>
                </div>
                <div className="flex items-center group">
                  <div className="bg-purple-500 bg-opacity-20 rounded-xl p-3 mr-4 group-hover:bg-opacity-30 transition-all duration-300">
                    <ClockIcon className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-100">Horarios</p>
                    <p className="text-white">Lun - Vie: 8:00 - 18:00, Sáb: 8:00 - 14:00</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-3xl font-semibold mb-8 text-center lg:text-left">Horarios Detallados</h3>
              <div className="bg-blue-800 bg-opacity-30 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-blue-400 border-opacity-30">
                    <span className="font-medium">Lunes - Viernes</span>
                    <span className="font-bold text-blue-200">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-400 border-opacity-30">
                    <span className="font-medium">Sábados</span>
                    <span className="font-bold text-blue-200">8:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Domingos</span>
                    <span className="font-bold text-red-300">Cerrado</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-xl font-semibold mb-4">¿Listo para empezar?</h4>
                <p className="text-blue-100 mb-6">
                  Únete a miles de clientes satisfechos y descubre por qué somos la ferretería de confianza en Santiago.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={goToLogin}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
                  >
                    Sistema de Gestión
                  </button>
                  <button className="flex-1 bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm">
                    Llamar Ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedProduct?.name}
      >
        {selectedProduct && (
          <div>
            <div className="mb-6">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
                <div className="flex items-center justify-center h-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Descripción</h4>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">SKU</h4>
                  <p className="text-gray-600">{selectedProduct.sku}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Stock Disponible</h4>
                  <p className="text-gray-600">{selectedProduct.inventory?.currentStock || 0} unidades</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">Precio</h4>
                <p className="text-3xl font-bold text-blue-600">
                  ${selectedProduct.pricing?.sellingPrice?.toLocaleString()}
                </p>
              </div>
              
              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Especificaciones</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex space-x-4">
              <button 
                onClick={goToLogin}
                className="btn-primary flex-1"
              >
                Contactar para Comprar
              </button>
              <button 
                onClick={closeModal}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}