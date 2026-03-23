# Papaya App Mozo - Documentación del Proyecto

## Descripción General
Aplicación PWA (Progressive Web App) para **mozos/camareros de restaurantes**, desarrollada con Angular y Capacitor para soporte multiplataforma (Web, Android, iOS).

Esta app permite a los meseros:
- **Tomar pedidos** de los clientes en mesas
- **Gestionar pedidos en holding** (pedidos pendientes/en espera)
- **Ver la carta/menú** del establecimiento en tiempo real
- **Comunicarse con cocina** vía WebSockets
- **Procesar pagos** y generar comprobantes
- **Gestionar mesas** y asignaciones

**App ID:** `mozo.papaya.com.pe`  
**Nombre:** Papaya App Mozo

## Stack Tecnológico

### Framework Principal
- **Angular:** v15.2.10
- **TypeScript:** v4.9.5
- **Node.js:** Compatible con v8.9.4+

### Capacitor (Multiplataforma)
- **@capacitor/core:** v7.4.3
- **@capacitor/android:** v7.4.3
- **@capacitor/ios:** v7.4.3
- **@capacitor/angular:** v2.0.3

### Plugins de Capacitor
- `@capacitor/app` - Gestión de la aplicación
- `@capacitor/browser` - Navegador in-app
- `@capacitor/geolocation` - Geolocalización
- `@capacitor/push-notifications` - Notificaciones push

### UI/UX
- **Angular Material:** v14.2.7
- **Angular CDK:** v14.2.7
- **SweetAlert2:** v11.22.0 (con `@sweetalert2/ngx-sweetalert2`)
- **Angular Star Rating:** v4.0.0-beta.3
- **CSS Star Rating:** v1.2.4

### Funcionalidades Clave
- **PWA:** Service Worker habilitado (`@angular/pwa`, `@angular/service-worker`)
- **Autenticación:** Auth0 (`@auth0/auth0-angular` v1.11.1)
- **Mapas:** Google Maps (`@angular/google-maps`, `@agm/core`)
- **QR Scanner:** `@zxing/ngx-scanner` v2.0.1
- **WebSockets:** `socket.io-client` v4.8.1
- **Geolocalización:** `geolocation-utils` v1.2.2
- **Time Picker:** `ngx-material-timepicker` v5.5.3
- **Performance:** `ngx-quicklink` v0.2.1

### Utilidades
- **String Similarity:** v4.0.4
- **Node Forge:** v1.3.1 (criptografía)

## Estructura del Proyecto

```
pwa-app-pedido-mozo/
├── src/
│   ├── app/
│   │   ├── componentes/        # Componentes reutilizables
│   │   ├── core/               # Módulo core (servicios globales)
│   │   ├── modelos/            # Modelos de datos/interfaces
│   │   ├── pages/              # Páginas de la aplicación
│   │   │   ├── cash/           # Gestión de caja
│   │   │   ├── cliente-profile/# Perfil de cliente
│   │   │   ├── encuesta/       # Encuestas
│   │   │   ├── holding/        # Pedidos en espera
│   │   │   ├── inicio/         # Página de inicio
│   │   │   ├── pagar-cuenta/   # Pago de cuenta
│   │   │   ├── pedido/         # Gestión de pedidos
│   │   │   ├── pedido-confirmado/ # Confirmación de pedidos
│   │   │   ├── reservar-mesa/  # Reservas de mesas
│   │   │   └── zona-establecimientos/ # Zonas y establecimientos
│   │   ├── shared/             # Módulo compartido
│   │   ├── app-routing.module.ts
│   │   ├── app.module.ts
│   │   └── auth.config.ts      # Configuración Auth0
│   ├── assets/                 # Recursos estáticos
│   │   └── js/                 # Scripts JS externos
│   │       ├── boton-pago.js
│   │       └── boton-payment.js
│   ├── environments/           # Configuración de entornos
│   ├── manifest.webmanifest    # Configuración PWA
│   └── styles.css              # Estilos globales
├── android/                    # Proyecto Android nativo
├── ios/                        # Proyecto iOS nativo
├── capacitor.config.ts         # Configuración Capacitor
├── angular.json                # Configuración Angular
├── ngsw-config.json           # Configuración Service Worker
└── package.json

```

## Comandos Principales

### Desarrollo
```bash
npm start                 # Inicia servidor de desarrollo (ng serve)
ng serve                  # Servidor dev en http://localhost:4200
npm run build             # Build de producción
npm test                  # Ejecutar tests unitarios
npm run lint              # Linter
npm run e2e               # Tests end-to-end
```

### Capacitor (Móvil)
```bash
npm run cap:sync          # Sincroniza web assets con plataformas nativas
npm run android           # Abre proyecto Android en Android Studio
npm run ios               # Abre proyecto iOS en Xcode
```

## Configuración de Entornos

### Environment Variables
- `production`: boolean - Modo producción
- `view_mozo`: boolean - Vista exclusiva para mozo (true) o mixta (false)

### Auth0 Configuration
Configurado en `src/app/auth.config.ts`:
- Domain
- Client ID
- Callback URI
- Cache: LocalStorage
- Refresh Tokens: Habilitado

## Características PWA

### Service Worker
- Habilitado en producción
- Configuración en `ngsw-config.json`
- Estrategias de caché configurables

### Manifest
- Configuración completa en `src/manifest.webmanifest`
- Iconos y splash screens
- Orientación y tema

## Build Configuration

### Desarrollo
- AOT: Deshabilitado
- Source Maps: Habilitados
- Optimización: Deshabilitada
- Vendor Chunk: Habilitado

### Producción
- AOT: Habilitado
- Source Maps: Deshabilitados
- Optimización: Habilitada
- Output Hashing: All
- Service Worker: Habilitado
- Budget: 2MB warning, 5MB error

## Módulos Principales

### CoreModule
Servicios y funcionalidades core de la aplicación

### SharedModule
Componentes, directivas y pipes compartidos

### PagesModule
Módulo lazy-loaded para las páginas de la aplicación

### ComponentesModule
Componentes reutilizables específicos del dominio

## Routing Strategy
- **LocationStrategy:** PathLocationStrategy (sin hash en URLs)
- Lazy loading habilitado para módulos de páginas

## Estilos
- Material Theme: Indigo-Pink
- CSS personalizado en `src/styles.css`
- Loading styles en `src/styles-app-loading.css`
- Star rating CSS incluido

## Scripts Externos
- jQuery (solo en tests)
- Botones de pago personalizados (boton-pago.js, boton-payment.js)

## Navegadores Soportados
Configuración en `browserslist`:
- Chrome, Firefox, Edge, Safari (últimas 2 versiones)
- iOS Safari (últimas 2 versiones)
- Android (últimas 2 versiones)

## Notas de Desarrollo

### Componentes Importantes
- **MainTabPedidosHoldingComponent:** Componente principal para gestión de pedidos en espera (selector: `app-main-tab-pedidos-holding`)

### Convenciones de Código
- Prefix de componentes: `app-`
- TypeScript strict mode
- TSLint configurado

### Performance
- Quicklink para prefetching de rutas
- Lazy loading de módulos
- Service Worker para caché offline

## Seguridad
- Auth0 para autenticación
- CORS configurado con `use-credentials`
- Node-forge para operaciones criptográficas

## Testing
- **Framework:** Jasmine + Karma
- **E2E:** Protractor
- Configuración en `src/karma.conf.js`

## Deployment
- Output: `dist/pwa-app-pedido-mozo/`
- Compatible con hosting estático
- Service Worker para funcionalidad offline

---

## Servicios Principales (Shared Services)

### `MipedidoService` (80KB - Servicio más grande)
Gestiona todo el flujo del pedido actual:
- `miPedidoObserver$` - Observable del pedido actual
- `countItemsObserve$` - Contador de items en el pedido
- `listItemsPedido` - Lista de items del pedido
- Maneja tipos de consumo, secciones, stock de items
- Integra con `SocketService` para tiempo real

### `EstablecimientoService`
Gestiona datos del establecimiento/restaurante:
- Almacena en localStorage (`sys::ed`)
- `loadEstablecimientoById(id)` - Carga datos de sede
- Gestiona áreas y mesas del local
- Maneja impresoras, símbolo de moneda
- Cache de establecimientos para delivery

### `SocketService`
Comunicación en tiempo real con el servidor:
- Conexión WebSocket con `socket.io-client`
- Envía datos de usuario, sede, organización
- Soporta modo holding (pedidos en espera)
- Reconexión automática

### `InfoTockenService`
Gestión del token y sesión del usuario:
- `infoUsToken` - Datos del usuario logueado
- Métodos: `isCliente()`, `isDelivery()`, `isSoloLlevar()`, `isReserva()`
- `isPuntoAutoPedido()`, `isTomaPedidoRapido()`, `isPuntoTomaPedidos()`
- Verifica sesión activa y tiempo de expiración

### `HoldingService`
Gestión de pedidos en holding/espera:
- `setHolding(idsede)` - Configura holding de sede
- `getMetodoPagoMozo()` - Métodos de pago disponibles (cached 24h)
- `setPedidoClienteHoldingMarcarAtendido()` - Marca pedido como atendido
- `setMarcarPedidoClientePagado()` - Marca pedido como pagado
- LocalStorage keys: `sys::pedido_cliente_holding`, `sys::pedido_cliente_holding_mesa`

### `CrudHttpService`
Servicio HTTP genérico para API REST:
- `postFree(data, event, action)` - POST sin autenticación
- Interceptor configurado para headers

### Otros Servicios Importantes
- **`AuthNativeService`** / **`Auth0Service`** - Autenticación
- **`ListenStatusService`** - Escucha estados de pedidos
- **`JsonPrintService`** - Impresión de comandas/tickets
- **`PagoTarjetaVisanetService`** - Pagos con tarjeta
- **`NotificacionPushService`** - Push notifications
- **`CalcDistanciaService`** - Cálculo de distancias (delivery)
- **`UtilitariosService`** - Funciones utilitarias

---

## Modelos de Datos Principales

### `ItemModel`
Representa un producto/plato del menú:
```typescript
- iditem, idseccion, idcategoria
- precio, precio_unitario, precio_total
- cantidad, cantidad_seleccionada
- des (descripción), indicaciones
- subitems_selected[] - Modificadores/extras
- itemtiposconsumo[] - Precios por tipo consumo
```

### `DeliveryEstablecimiento`
Datos completos del establecimiento:
```typescript
- idsede, idorg, nombre, direccion
- latitude, longitude, codigo_postal
- hora_ini, hora_fin, cerrado
- pwa_delivery_* - Configuraciones delivery
- impresoras[], areas_mesas
- simbolo_moneda, mesas_alfanumerica
```

### `PedidoModel`
Contenedor del pedido:
```typescript
- tipoconsumo: TipoConsumoModel[]
```

### `TipoConsumoModel`
Tipos: Mesa, Llevar, Delivery, Reserva

### `HoldingModel`
Pedidos en espera/holding

---

## Flujo Principal de la App (Mozo)

1. **Login** → Auth0 o autenticación nativa
2. **Carga Establecimiento** → `EstablecimientoService.loadEstablecimientoById()`
3. **Conexión Socket** → `SocketService.connect()` con datos de usuario/sede
4. **Pantalla Principal** → Vista de carta/menú
5. **Tomar Pedido**:
   - Seleccionar mesa
   - Agregar items al pedido (`MipedidoService`)
   - Configurar subitems/modificadores
   - Enviar a cocina vía Socket
6. **Gestión Holding** → Ver pedidos pendientes, marcar atendidos/pagados
7. **Cobro** → Procesar pago, generar comprobante

---

## Rutas Activas

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | InicioModule | Pantalla de inicio |
| `/home` | InicioModule | Home |
| `/pedido` | PedidoModule | Gestión de pedidos (AuthGuard) |
| `/holding` | HoldingModule | Pedidos en espera (AuthGuard) |

*Nota: Varias rutas están comentadas (encuesta, pagar-cuenta, reservar-mesa, etc.)*

---

## LocalStorage Keys

| Key | Descripción |
|-----|-------------|
| `sys::ed` | Datos del establecimiento (base64) |
| `sys::holding` | Datos de holding (base64) |
| `sys::pedido_cliente_holding` | ID pedido cliente holding |
| `sys::pedido_cliente_holding_mesa` | Mesa del pedido holding |
| `sys::pedido_cliente_holding_referencia` | Referencia del pedido |
| `sys:ech` | Cache de establecimientos (base64) |
| `sys::scan` | ID del último scan QR |
| `sys::s` | Nombre de sede |
| `sys::it` | IP del cliente |
| `sys::numtis` | Timestamp inicio sesión |
| `::token` | Token de autenticación |
| `sys::cached_metodo_pago` | Cache métodos de pago (24h) |

---

## API Endpoints (Ejemplos)

- `POST delivery/get-establecimientos` - Obtener datos establecimiento
- `POST ini/areas-mesas` - Obtener áreas y mesas
- `POST holding/get-holding-by-idsede` - Obtener holding de sede
- `POST holding/get-metodo-pago-mozo` - Métodos de pago
- `POST holding/set-marcar-pedido-cliente-holding-atendido` - Marcar atendido
- `POST holding/set-marcar-pedido-cliente-holding-pagado` - Marcar pagado
- `POST pedido/get-last-comsion-entrega-sede` - Comisión entrega
- `POST pedido/get-find-cliente-by-name` - Buscar cliente
- `POST pedido/register-scan` - Registrar scan QR

---

## Versión
**v1.0.0**

---

*Última actualización: Marzo 2026*
