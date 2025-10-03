# Backend - Ferretería

Backend completo para sistema de gestión de ferretería desarrollado con Node.js, Express y MongoDB.

## 🚀 Características

### Módulos Principales
- **Autenticación y Autorización**: JWT, roles de usuario (admin, employee, cashier)
- **Gestión de Productos**: CRUD completo, categorías, imágenes, stock
- **Control de Inventario**: Movimientos, ajustes, transferencias, alertas de stock bajo
- **Ventas**: POS completo, múltiples métodos de pago, reembolsos
- **Clientes**: Gestión de clientes, crédito, historial de compras
- **Proveedores**: Administración de proveedores y sus productos
- **Reportes**: Dashboard, reportes de ventas, productos, clientes, financieros

### Funcionalidades Destacadas
- ✅ Sistema de autenticación con JWT
- ✅ Control de roles y permisos
- ✅ Gestión completa de inventario
- ✅ Sistema de ventas con control de stock
- ✅ Subida de imágenes para productos
- ✅ Reportes y analytics
- ✅ API RESTful bien documentada
- ✅ Manejo de errores robusto
- ✅ Validaciones de datos
- ✅ Transacciones de base de datos
- ✅ Seed de datos de ejemplo

## 📋 Requisitos

- Node.js 16+
- MongoDB 4.4+
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia el archivo `.env` y ajusta las variables según tu entorno:
```bash
# El archivo .env ya está incluido con valores por defecto
```

3. **Iniciar MongoDB:**
Asegúrate de que MongoDB esté corriendo en tu sistema.

4. **Poblar la base de datos (opcional):**
```bash
npm run seed
```

5. **Iniciar el servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 API Endpoints

### Autenticación
```
POST /api/auth/register    - Registrar usuario
POST /api/auth/login       - Iniciar sesión
GET  /api/auth/profile     - Obtener perfil
PUT  /api/auth/profile     - Actualizar perfil
POST /api/auth/change-password - Cambiar contraseña
```

### Productos
```
GET    /api/products           - Listar productos
GET    /api/products/:id       - Obtener producto
POST   /api/products           - Crear producto
PUT    /api/products/:id       - Actualizar producto
DELETE /api/products/:id       - Eliminar producto
GET    /api/products/reports/low-stock - Productos con stock bajo
POST   /api/products/:id/images - Subir imagen
```

### Categorías
```
GET    /api/categories         - Listar categorías
GET    /api/categories/:id     - Obtener categoría
POST   /api/categories         - Crear categoría
PUT    /api/categories/:id     - Actualizar categoría
DELETE /api/categories/:id     - Eliminar categoría
GET    /api/categories/structure/tree - Árbol de categorías
```

### Clientes
```
GET    /api/customers          - Listar clientes
GET    /api/customers/:id      - Obtener cliente
POST   /api/customers          - Crear cliente
PUT    /api/customers/:id      - Actualizar cliente
DELETE /api/customers/:id      - Eliminar cliente
GET    /api/customers/search/quick - Búsqueda rápida
PUT    /api/customers/:id/credit - Actualizar crédito
```

### Proveedores
```
GET    /api/suppliers          - Listar proveedores
GET    /api/suppliers/:id      - Obtener proveedor
POST   /api/suppliers          - Crear proveedor
PUT    /api/suppliers/:id      - Actualizar proveedor
DELETE /api/suppliers/:id      - Eliminar proveedor
GET    /api/suppliers/search/quick - Búsqueda rápida
PUT    /api/suppliers/:id/rating - Actualizar calificación
GET    /api/suppliers/:id/products - Productos del proveedor
```

### Ventas
```
GET    /api/sales              - Listar ventas
GET    /api/sales/:id          - Obtener venta
POST   /api/sales              - Crear venta
PUT    /api/sales/:id/cancel   - Cancelar venta
POST   /api/sales/:id/refund   - Procesar reembolso
GET    /api/sales/reports/daily - Reporte diario
```

### Inventario
```
GET    /api/inventory          - Resumen de inventario
GET    /api/inventory/movements - Movimientos de inventario
POST   /api/inventory/adjust   - Ajustar inventario
POST   /api/inventory/transfer - Transferir inventario
GET    /api/inventory/low-stock - Stock bajo
GET    /api/inventory/out-of-stock - Productos agotados
GET    /api/inventory/valuation - Valorización
GET    /api/inventory/:productId/history - Historial de producto
```

### Reportes
```
GET /api/reports/dashboard     - Dashboard principal
GET /api/reports/sales         - Reporte de ventas
GET /api/reports/products      - Reporte de productos
GET /api/reports/customers     - Reporte de clientes
GET /api/reports/inventory/movements - Movimientos de inventario
GET /api/reports/financial     - Reporte financiero
```

## 🔐 Autenticación

Todas las rutas (excepto login y register) requieren autenticación mediante JWT Bearer token:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

## 👥 Roles de Usuario

- **admin**: Acceso total al sistema
- **employee**: Puede gestionar productos, clientes, proveedores y realizar ventas
- **cashier**: Solo puede realizar ventas y consultar información básica

## 🗃️ Modelos de Datos

### Usuario
- Información personal y credenciales
- Rol y permisos
- Último login

### Producto
- Información básica y especificaciones
- Precios (costo, venta, mayorista)
- Inventario (stock actual, mínimo, máximo)
- Imágenes y ubicación
- Categoría y proveedor

### Categoría
- Estructura jerárquica (categorías y subcategorías)
- Imagen opcional

### Cliente
- Información personal o empresarial
- Sistema de crédito
- Historial de compras

### Proveedor
- Información de contacto
- Términos de pago y entrega
- Calificación

### Venta
- Items vendidos con precios y cantidades
- Información del cliente y cajero
- Método de pago y totales
- Estado y reembolsos

### Movimiento de Inventario
- Tracking completo de cambios en stock
- Referencia a documentos origen
- Usuario responsable

## 🔧 Configuración de Desarrollo

### Scripts disponibles:
```bash
npm start      # Iniciar servidor de producción
npm run dev    # Iniciar servidor de desarrollo con nodemon
npm run seed   # Poblar base de datos con datos de ejemplo
npm test       # Ejecutar pruebas (configurar jest)
```

### Datos de Prueba

Después de ejecutar `npm run seed`, puedes usar estas credenciales:

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Cajero:**
- Usuario: `cajero1`
- Contraseña: `cajero123`

**Empleado:**
- Usuario: `empleado1`
- Contraseña: `empleado123`

## 📊 Estructura del Proyecto

```
backend/
├── models/           # Modelos de MongoDB/Mongoose
├── routes/           # Rutas de la API
├── middleware/       # Middlewares personalizados
├── scripts/          # Scripts de utilidad (seed, etc.)
├── uploads/          # Archivos subidos
├── server.js         # Punto de entrada
├── package.json      # Dependencias y scripts
└── .env             # Variables de entorno
```

## 🚦 Códigos de Estado HTTP

- `200` - OK
- `201` - Creado exitosamente
- `400` - Datos inválidos
- `401` - No autorizado
- `403` - Prohibido (permisos insuficientes)
- `404` - No encontrado
- `500` - Error interno del servidor

## 📝 Notas Importantes

1. **Seguridad**: Cambiar JWT_SECRET en producción
2. **Base de datos**: Configurar conexión a MongoDB Atlas para producción
3. **Archivos**: Configurar servicio de almacenamiento en la nube para imágenes
4. **Email**: Configurar servicio de email para notificaciones
5. **Logs**: Implementar sistema de logging para producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.