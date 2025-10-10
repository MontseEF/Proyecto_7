# Imágenes estáticas de productos

Esta carpeta contiene imágenes de productos para acceso directo desde el frontend.

## Convención de nombres:
- Usar el SKU del producto: `PROD-0001.jpg`
- O usar nombres descriptivos: `taladro-dewalt-20v.jpg`

## URL de acceso:
http://localhost:5173/images/products/nombre-imagen.jpg

## Ejemplo de uso en React:
```jsx
<img 
  src="/images/products/PROD-0001.jpg" 
  alt="Producto 1"
  className="w-full h-48 object-cover"
/>
```