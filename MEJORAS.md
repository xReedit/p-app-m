# Análisis de Código - Oportunidades de Mejora

## Resumen de Limpieza Realizada

### Archivos Movidos a `_unused_code/`

Se identificaron y movieron los siguientes módulos/componentes que **NO se utilizan** en la app de mozo:

#### Pages (Módulos completos no utilizados)
| Carpeta | Descripción | Razón |
|---------|-------------|-------|
| `pages/pagar-cuenta/` | Módulo de pago de cuenta | Rutas comentadas en app-routing |
| `pages/encuesta/` | Módulo de encuestas | Rutas comentadas |
| `pages/reservar-mesa/` | Reservas de mesas | Rutas comentadas |
| `pages/cash/` | Módulo ATM/Caja | Rutas comentadas |
| `pages/cliente-profile/` | Perfil de cliente | Rutas comentadas |
| `pages/zona-establecimientos/` | Zona delivery/establecimientos | Rutas comentadas |
| `pages/pedido-confirmado/` | Confirmación de pedido | Rutas comentadas |

#### Componentes (No referenciados en código activo)
| Componente | Descripción |
|------------|-------------|
| `datos-delivery/` | Datos de delivery |
| `item-comercio/` | Item de comercio |
| `confirmar-delivery/` | Confirmar delivery |
| `menu-lateral-cliente/` | Menú lateral cliente |
| `seleccionar-direccion/` | Selector de dirección |
| `agregar-direccion/` | Agregar dirección |
| `comp-propina-delivery/` | Propina delivery |
| `mapa-solo/` | Mapa standalone |
| `comp-datos-reserva/` | Datos de reserva |
| `tipo-vehiculo/` | Tipo de vehículo |
| `select-ciudad-delivery/` | Selector ciudad delivery |
| `comp-pide-express/` | Pide express |
| `comp-pide-lo-que-quieras/` | Pide lo que quieras |
| `comp-op-costo-estimado/` | Costo estimado |
| `tiempo-programado/` | Tiempo programado |
| `dialog-tiempo-entrega/` | Dialog tiempo entrega |
| `dialog-select-direccion/` | Dialog seleccionar dirección |
| `dialog-direccion-cliente-delivery/` | Dialog dirección cliente |
| `encuesta-opcion/` | Opción de encuesta |
| `dialog-calificacion/` | Dialog calificación |
| `comp-calificacion/` | Componente calificación |
| `comp-get-datos-cliente/` | Obtener datos cliente |

---

## Oportunidades de Mejora

### 1. **Reducción del Bundle Size** ⚡
- **Antes:** El proyecto incluía ~7 módulos de páginas no utilizados
- **Después:** Solo se compilan los módulos activos (`inicio`, `pedido`, `holding`)
- **Impacto:** Reducción significativa en tiempo de build y tamaño del bundle

### 2. **Dependencias No Utilizadas en `package.json`** 📦
Revisar si estas dependencias aún son necesarias:
- `@agm/core` - Google Maps (¿se usa en la app de mozo?)
- `geolocation-utils` - Solo usado en `dialog-ubicacion`
- `angular-star-rating` / `css-star-rating` - Para calificaciones (movido a _unused)
- `ngx-material-timepicker` - Comentado en imports

### 3. **Código Comentado** 🧹
Hay mucho código comentado que debería limpiarse:
- `app-routing.module.ts` - Rutas comentadas (líneas 52-96)
- `app.module.ts` - Imports comentados
- `componentes.module.ts` - entryComponents comentados

### 4. **Imports de RxJS Incorrectos** ⚠️
Warnings de build indican imports internos de RxJS:
```
- rxjs/internal/Subject
- rxjs/internal/operators
- rxjs/internal/operators/takeUntil
```
**Solución:** Cambiar a imports públicos:
```typescript
// Incorrecto
import { Subject } from 'rxjs/internal/Subject';
// Correcto
import { Subject } from 'rxjs';
```

### 5. **Servicios Potencialmente No Utilizados** 🔍
Revisar uso real de estos servicios:
- `calc-distancia.service.ts` (15KB) - ¿Se usa para delivery?
- `sede-delivery.service.ts` - Relacionado a delivery
- `pago-tarjeta-visanet.service.ts` - ¿Se usa pago con tarjeta?
- `maps-service.service.ts` - ¿Se usan mapas?

### 6. **Modelos No Utilizados** 📋
Revisar si estos modelos se usan:
- `datos.delivery.model.ts`
- `delivery.direccion.cliente.model.ts`
- `datos.calificado.model.ts`

### 7. **API Key Expuesta** 🔐
~~Key de Google Maps hardcodeada en el código.~~  
**Hecho:** ahora se lee desde `.env` (`GOOGLE_MAPS_API_KEY`) vía `scripts/sync-env.js` → `environment.googleMapsApiKey`.

### 8. **Archivos de Test Vacíos** 🧪
Muchos archivos `.spec.ts` tienen tests básicos auto-generados sin implementación real.

### 9. **Actualización de Angular** 📈
- Angular actual: v15.2.10
- Considerar actualizar a Angular 16+ para mejor rendimiento y features

### 10. **Browserslist Desactualizado** 🌐
El archivo `browserslist` incluye navegadores muy antiguos que generan warnings.

---

## Acciones Recomendadas (Prioridad)

### Alta Prioridad
1. ✅ Limpiar código no utilizado (HECHO)
2. 🔲 Corregir imports de RxJS
3. 🔲 Mover API key a environment

### Media Prioridad
4. 🔲 Eliminar dependencias no utilizadas de package.json
5. 🔲 Limpiar código comentado
6. 🔲 Actualizar browserslist

### Baja Prioridad
7. 🔲 Revisar servicios no utilizados
8. 🔲 Implementar tests reales
9. 🔲 Considerar actualización de Angular

---

## Estructura Final del Proyecto

```
src/app/
├── componentes/          # Componentes reutilizables (limpiado)
├── core/                 # Módulo core
├── modelos/              # Modelos de datos
├── pages/
│   ├── inicio/           # ✅ Activo
│   ├── pedido/           # ✅ Activo
│   └── holding/          # ✅ Activo
└── shared/               # Servicios y utilidades

_unused_code/             # Código no utilizado (backup)
├── pages/
└── componentes/
```

---

*Generado: Marzo 2026*
