import React, { useState } from 'react';

const ProductImage = ({ product, className = "w-full h-full object-cover" }) => {
  const [imageError, setImageError] = useState(false);
  
  // Solo usar imágenes del frontend estático
  const getImageSrc = () => {
    // Intentar con el SKU del producto
    return `/images/products/${product.sku}.jpg`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    // Mostrar icono de herramienta como fallback
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <span className="text-6xl">🔧</span>
      </div>
    );
  }

  return (
    <img 
      src={getImageSrc()}
      alt={product.name}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

export default ProductImage;