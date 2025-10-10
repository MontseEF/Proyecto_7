import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Modal from '../components/common/Modal';
import { api } from '../services/api';

// Importa los iconos de @heroicons/react/24/outline
import {
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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
              <button onClick={() => scrollToSection('inicio')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Inicio</button>
              <button onClick={() => scrollToSection('servicios')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Servicios</button>
              <button onClick={() => scrollToSection('productos')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Productos</button>
              <button onClick={() => scrollToSection('contacto')} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Contacto</button>
              <button onClick={goToLogin} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md">Iniciar Sesión</button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-blue-600 p-2">
                {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button onClick={() => scrollToSection('inicio')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium">Inicio</button>
                <button onClick={() => scrollToSection('servicios')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium">Servicios</button>
                <button onClick={() => scrollToSection('productos')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium">Productos</button>
                <button onClick={() => scrollToSection('contacto')} className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium">Contacto</button>
                <button onClick={goToLogin} className="block w-full text-left px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium">Iniciar Sesión</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div id="inicio" className="bg-blue-600 text-white pt-16">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Bienvenido a Ferretería Monserrat</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Tu ferretería de confianza con más de 20 años sirviendo a la comunidad. 
              Herramientas, materiales de construcción y todo lo que necesitas para tus proyectos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => scrollToSection('productos')} className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400">Ver Catálogo</button>
              <button onClick={goToLogin} className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">Sistema de Gestión</button>
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

      {/* Wave Separator */}
      <div className="relative -mt-8">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24">
          <path fill="#F3F4F6" d="M0,32L48,53.3C96,75,192,117,288,117.3C384,117,480,75,576,69.3C672,64,768,96,864,117.3C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      {/* Productos Section */}
      <section id="productos" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Catálogo de Productos</h2>
        {loading ? (
          <div className="text-center text-gray-500">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-contain mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">{product.description}</p>
                <span className="text-blue-600 font-bold text-xl mb-4">${product.price}</span>
                <button
                  onClick={() => openProductModal(product)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal para detalles de producto */}
      {isModalOpen && selectedProduct && (
        <Modal onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-48 h-48 object-contain mb-4 mx-auto" />
            <p className="mb-2">{selectedProduct.description}</p>
            <span className="text-blue-600 font-bold text-xl mb-4 block">${selectedProduct.price}</span>
            <button
              onClick={closeModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {/* Contacto Section */}
      <section id="contacto" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <MapPinIcon className="w-8 h-8 text-blue-600" />
              <span className="text-gray-700">Av. Principal 123, Ciudad</span>
            </div>
            <div className="flex items-center space-x-4">
              <PhoneIcon className="w-8 h-8 text-blue-600" />
              <span className="text-gray-700">+52 123 456 7890</span>
            </div>
            <div className="flex items-center space-x-4">
              <EnvelopeIcon className="w-8 h-8 text-blue-600" />
              <span className="text-gray-700">contacto@ferreteriamonserrat.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}