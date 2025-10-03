# 🏪 Sistema de Gestión para Ferretería

Sistema completo de gestión para ferretería desarrollado con **Node.js/Express** (backend) y **React** (frontend).

## 🚀 Características Principales

### 📊 **Dashboard Completo**
- Métricas de ventas en tiempo real
- Productos más vendidos
- Clientes frecuentes
- Alertas de stock bajo
- Resumen financiero

### 🛍️ **Sistema de Ventas (POS)**
- Punto de venta intuitivo
- Múltiples métodos de pago (efectivo, tarjeta, crédito)
- Búsqueda rápida de productos
- Gestión de clientes
- Generación automática de tickets

### 📦 **Gestión de Inventario**
- Control de stock en tiempo real
- Alertas de stock mínimo
- Movimientos de inventario
- Transferencias entre ubicaciones
- Valorización de stock

### 👥 **Gestión de Clientes**
- Base de datos de clientes
- Sistema de crédito
- Historial de compras
- Clientes frecuentes
- Búsqueda avanzada

### 🚚 **Gestión de Proveedores**
- Administración de proveedores
- Información de contacto
- Términos de pago
- Productos por proveedor
- Calificaciones

### 📈 **Reportes y Analytics**
- Reportes de ventas por período
- Análisis de productos
- Comportamiento de clientes
- Reportes financieros
- Exportación de datos

## 🏗️ Arquitectura del Sistema

```
proyecto7/
├── backend/                 # API REST con Node.js/Express
│   ├── models/             # Modelos de MongoDB
│   ├── routes/             # Rutas de la API
│   ├── middleware/         # Middlewares personalizados
│   ├── services/           # Lógica de negocio
│   └── server.js          # Servidor principal
│
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── contexts/      # Context providers
│   │   ├── services/      # Servicios de API
│   │   └── App.js        # Componente principal
│   └── public/
│
└── README.md              # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Subida de archivos

### Frontend  
- **React 18** - Framework frontend
- **React Router** - Navegación
- **TanStack Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Tailwind CSS** - Framework de estilos
- **Heroicons** - Iconos
- **Axios** - Cliente HTTP

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone [url-del-repositorio]
cd proyecto7
```

### 2. Configurar el Backend
```bash
cd backend
npm install

# Configurar variables de entorno (opcional)
cp .env .env.local
# Editar .env.local con tus configuraciones

# Poblar base de datos con datos de ejemplo
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Configurar el Frontend
```bash
cd frontend
npm install

# Iniciar servidor de desarrollo
npm start
```

El frontend estará disponible en `http://localhost:3001`

## 🔐 Credenciales de Prueba

Después de ejecutar `npm run seed` en el backend:

| Rol       | Usuario    | Contraseña  | Permisos                    |
|-----------|------------|-------------|----------------------------|
| Admin     | admin      | admin123    | Acceso total al sistema    |
| Empleado  | empleado1  | empleado123 | Gestión general, no config |
| Cajero    | cajero1    | cajero123   | Solo ventas y consultas    |

## 📋 Requisitos del Sistema

- **Node.js** 16 o superior
- **MongoDB** 4.4 o superior (local o MongoDB Atlas)
- **npm** o **yarn**
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🔧 Configuración Avanzada

### Variables de Entorno - Backend
```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ferreteria_db
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
```

### Variables de Entorno - Frontend
```bash
REACT_APP_API_URL=http://localhost:3000/api
```

## 📊 Funcionalidades Detalladas

### 🏪 **Gestión de Productos**
- ✅ CRUD completo de productos
- ✅ Categorías jerárquicas
- ✅ Códigos SKU y códigos de barras
- ✅ Imágenes de productos
- ✅ Control de precios (costo, venta, mayorista)
- ✅ Especificaciones técnicas
- ✅ Ubicaciones en almacén

### 💰 **Sistema de Ventas**
- ✅ Interfaz POS intuitiva
- ✅ Búsqueda rápida de productos
- ✅ Cálculo automático de totales e impuestos
- ✅ Descuentos por producto o venta total
- ✅ Múltiples métodos de pago
- ✅ Ventas a crédito
- ✅ Reembolsos y cancelaciones
- ✅ Impresión de tickets

### 📊 **Reportes Disponibles**
- ✅ Dashboard ejecutivo
- ✅ Ventas por período (diario, semanal, mensual)
- ✅ Productos más vendidos
- ✅ Análisis de clientes
- ✅ Reportes de inventario
- ✅ Estados financieros
- ✅ Análisis de rentabilidad

### 🔒 **Seguridad**
- ✅ Autenticación JWT
- ✅ Roles y permisos granulares
- ✅ Encriptación de contraseñas
- ✅ Rate limiting
- ✅ Validación de datos
- ✅ Headers de seguridad

## 🎯 Roadmap Futuro

### 📱 **Próximas Funcionalidades**
- [ ] App móvil con React Native
- [ ] Integración con códigos QR
- [ ] Sistema de fidelización de clientes
- [ ] Integración con facturación electrónica
- [ ] Dashboard para clientes
- [ ] Sistema de reservas
- [ ] Integración con WhatsApp Business
- [ ] Multi-tienda/sucursales

### 🔧 **Mejoras Técnicas**
- [ ] Tests automatizados (Jest/Cypress)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Monitoreo y logging
- [ ] Backup automatizado
- [ ] Performance optimization

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte técnico:
- Crear un Issue en GitHub
- Documentación en `/docs`
- Wiki del proyecto

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 🎉 ¡Empezar Ahora!

1. **Clonar el repositorio**
2. **Seguir las instrucciones de instalación**
3. **Iniciar ambos servidores (backend y frontend)**
4. **Acceder a `http://localhost:3001`**
5. **Usar credenciales de prueba para explorar**

¡El sistema está listo para gestionar tu ferretería! 🔧⚒️

---

**Desarrollado con ❤️ para pequeñas y medianas ferreterías**