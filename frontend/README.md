# Frontend - Ferretería React

Frontend completo para sistema de gestión de ferretería desarrollado con React, Tailwind CSS y React Query.

## 🚀 Características

### Tecnologías Principales
- **React 18**: Framework principal
- **React Router DOM**: Navegación y rutas
- **React Query**: Gestión de estado del servidor y cache
- **React Hook Form**: Manejo de formularios
- **Tailwind CSS**: Framework de estilos
- **Heroicons**: Iconos
- **React Hot Toast**: Notificaciones
- **Axios**: Cliente HTTP

### Funcionalidades Principales
- ✅ Sistema de autenticación completo
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión de productos, categorías, clientes y proveedores
- ✅ Sistema de ventas (POS)
- ✅ Control de inventario
- ✅ Reportes y analytics
- ✅ Interfaz responsive
- ✅ Notificaciones en tiempo real
- ✅ Manejo de errores robusto

### Módulos Incluidos
- **Dashboard**: Métricas principales y acciones rápidas
- **Productos**: CRUD completo con imágenes y categorías
- **Clientes**: Gestión de clientes con sistema de crédito
- **Proveedores**: Administración de proveedores
- **Ventas**: Sistema POS completo
- **Inventario**: Control de stock y movimientos
- **Reportes**: Analytics y reportes detallados

## 📋 Requisitos

- Node.js 16+
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Crear archivo .env.local (opcional)
REACT_APP_API_URL=http://localhost:3000/api
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3001`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes generales
│   └── layout/         # Componentes de layout
├── contexts/           # Context providers
├── pages/              # Páginas principales
├── services/           # Servicios de API
├── App.js             # Componente principal
├── index.js           # Punto de entrada
└── index.css          # Estilos globales
```

## 🔐 Autenticación

El sistema incluye:
- Login/Register
- Protección de rutas
- Manejo de roles (admin, employee, cashier)
- JWT tokens
- Renovación automática de sesión

### Credenciales de Prueba
- **Admin**: admin / admin123
- **Empleado**: empleado1 / empleado123  
- **Cajero**: cajero1 / cajero123

## 🎨 Sistema de Diseño

### Colores Principales
- **Primary**: Azul (#3B82F6)
- **Success**: Verde (#22C55E)
- **Warning**: Amarillo (#F59E0B)
- **Danger**: Rojo (#EF4444)

### Componentes Base
- **Botones**: btn-primary, btn-secondary, btn-danger, btn-success
- **Inputs**: input-field, input-error
- **Cards**: card, card-header, card-body
- **Badges**: badge-success, badge-warning, badge-danger
- **Tables**: table con estilos predefinidos

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Layout completo con sidebar
- **Tablet**: Layout adaptado
- **Mobile**: Sidebar colipsible y navegación táctil

## 🔧 Configuración de Desarrollo

### Scripts Disponibles

```bash
npm start          # Servidor de desarrollo
npm run build      # Build de producción  
npm test           # Ejecutar tests
npm run eject      # Eject de Create React App
```

### Variables de Entorno

```bash
REACT_APP_API_URL=http://localhost:3000/api  # URL del backend
```

## 📊 Gestión de Estado

### React Query
- Cache inteligente de datos
- Sincronización automática
- Manejo de loading y errores
- Invalidación de cache
- Refetch automático

### Context API
- AuthContext: Gestión de autenticación
- Estado global mínimo
- Reducers para lógica compleja

## 🚦 Rutas Principales

```
/login              # Página de login
/register           # Registro de usuarios
/dashboard          # Dashboard principal
/products           # Gestión de productos
/categories         # Gestión de categorías
/customers          # Gestión de clientes
/suppliers          # Gestión de proveedores
/sales              # Sistema de ventas
/inventory          # Control de inventario
/reports            # Reportes y analytics
/profile            # Perfil de usuario
```

## 🎯 Características Destacadas

### Dashboard Interactivo
- Métricas en tiempo real
- Gráficos y estadísticas
- Productos más vendidos
- Clientes frecuentes
- Acciones rápidas

### Sistema POS
- Búsqueda de productos
- Cálculo automático de totales
- Múltiples métodos de pago
- Gestión de clientes
- Impresión de tickets

### Gestión de Inventario
- Control de stock en tiempo real
- Alertas de stock bajo
- Movimientos de inventory
- Valorización de stock
- Historial de productos

### Reportes Avanzados
- Reportes de ventas por período
- Análisis de productos
- Comportamiento de clientes
- Reportes financieros
- Exportación de datos

## 🔍 Funcionalidades Avanzadas

### Búsqueda y Filtros
- Búsqueda en tiempo real
- Filtros múltiples
- Ordenamiento dinámico
- Paginación eficiente

### Notificaciones
- Toast notifications
- Estados de loading
- Mensajes de error
- Confirmaciones de acciones

### Validación de Formularios
- Validación en tiempo real
- Mensajes de error contextuales
- Prevención de envíos duplicados
- Autocompletado inteligente

## 📈 Optimizaciones

### Performance
- Code splitting por rutas
- Lazy loading de componentes
- Optimización de imágenes
- Cache de API responses

### UX/UI
- Loading skeletons
- Transiciones suaves
- Feedback visual inmediato
- Navegación intuitiva

## 🧪 Testing

```bash
npm test           # Ejecutar tests unitarios
npm run test:coverage  # Coverage report
```

## 📦 Build y Deployment

```bash
npm run build      # Crear build optimizado
npm run serve      # Servir build localmente
```

### Variables de Producción
```bash
REACT_APP_API_URL=https://api.tuferreteria.com/api
```

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Notas de Desarrollo

### Estructura de Componentes
- Un componente por archivo
- Props tipadas con PropTypes
- Hooks personalizados para lógica reutilizable
- Componentes funcionales únicamente

### Estándares de Código
- ESLint + Prettier configurados
- Nomenclatura consistente
- Comentarios JSDoc para funciones complejas
- Imports organizados

### API Integration
- Servicios centralizados en `/services`
- Manejo de errores consistente
- Interceptors de Axios configurados
- Retry automático en fallos de red

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de CORS**: Verificar configuración del backend
2. **401 Unauthorized**: Token expirado, hacer login nuevamente
3. **Componentes no cargan**: Verificar imports y rutas
4. **Estilos no aplicados**: Verificar configuración de Tailwind

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.