import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Modal from '../components/common/Modal';
import Cart from '../components/common/Cart';
import Notification from '../components/common/Notification';
import ProductImage from '../components/common/ProductImage';
import { api } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../image/logo.jpg';

export default function HomePage() {
  const navigate = useNavigate();
  const { add, itemCount } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

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

  const addToCart = (product) => {
    add(product, 1);
    setNotification({
      message: `${product.name} agregado al carrito`,
      type: 'success'
    });
  };

  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalog-section');
    if (catalogSection) {
      catalogSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  // Lógica de paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    scrollToCatalog();
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Ferretería Zona Austral Logo" 
                className="h-12 w-auto rounded-md mr-3" 
              />
              <h1 className="text-2xl font-bold text-blue-600">Ferretería Zona Austral</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={openCart}
                className="relative bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 flex items-center"
              >
                🛒 Carrito
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/orders')}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    📋 Mis Pedidos
                  </button>
                  <span className="text-gray-600">
                    Hola, {user.firstName || user.fullName || user.username || 'Usuario'}
                  </span>
                </div>
              ) : (
                <button 
                  onClick={goToLogin}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Bienvenido a Ferretería Zona Austral</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Tu ferretería de confianza con más de 20 años sirviendo a la comunidad.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={scrollToCatalog}
              className="bg-yellow-500 text-black px-6 py-3 rounded font-semibold hover:bg-yellow-400"
            >
              Ver Catálogo
            </button>
            <button 
              onClick={goToLogin}
              className="border-2 border-white text-white px-6 py-3 rounded font-semibold hover:bg-white hover:text-blue-600"
            >
              Sistema de Gestión
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegirnos?</h2>
            <p className="text-gray-600">Nos destacamos por nuestro servicio y calidad</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">Productos de las mejores marcas</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Atención Rápida</h3>
              <p className="text-gray-600">Servicio eficiente y personalizado</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ubicación Céntrica</h3>
              <p className="text-gray-600">Fácil acceso y estacionamiento</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="catalog-section" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Catálogo Completo</h2>
            <p className="text-gray-600">Todos nuestros productos disponibles - {products.length} artículos</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentProducts.map((product) => (
                <div 
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openProductModal(product)}
                >
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <ProductImage 
                      product={product}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-blue-600">
                        ${product.pricing?.sellingPrice?.toLocaleString() || 0}
                      </span>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        Stock: {product.inventory?.currentStock || 0}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                      disabled={!product.inventory?.currentStock || product.inventory?.currentStock === 0}
                    >
                      {!product.inventory?.currentStock || product.inventory?.currentStock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {/* Páginas */}
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                  if (pageNumber <= totalPages) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Mostrando {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, products.length)} de {products.length} productos
            </p>
            <button 
              onClick={goToLogin}
              className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
            >
              Iniciar Sesión para Comprar
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contáctanos</h2>
            <p className="text-xl">Estamos aquí para ayudarte</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Información de Contacto</h3>
              <div className="space-y-4">
                <p>📍 Av. Principal 123, Santiago, Chile</p>
                <p>📞 +56 2 2345 6789</p>
                <p>✉️ info@ferreteriaaustral.cl</p>
                <p>🕒 Lun - Vie: 8:00 - 18:00, Sáb: 8:00 - 14:00</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6">Horarios</h3>
              <div className="bg-blue-700 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Lunes - Viernes</span>
                    <span className="font-semibold">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados</span>
                    <span className="font-semibold">8:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos</span>
                    <span className="font-semibold text-red-300">Cerrado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <div className="h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-8xl">🔧</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Descripción</h4>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">SKU</h4>
                  <p className="text-gray-600">{selectedProduct.sku}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Stock</h4>
                  <p className="text-gray-600">{selectedProduct.inventory?.currentStock || 0} unidades</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold">Precio</h4>
                <p className="text-3xl font-bold text-blue-600">
                  ${selectedProduct.pricing?.sellingPrice?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => {
                  addToCart(selectedProduct);
                  closeModal();
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex-1"
                disabled={!selectedProduct.quantity || selectedProduct.quantity === 0}
              >
                {!selectedProduct.quantity || selectedProduct.quantity === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
              </button>
              <button 
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Component */}
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}