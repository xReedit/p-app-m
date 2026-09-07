---
name: Papaya App Mozo
description: App de toma de pedidos para mozos; listas planas, índigo Material, Ubuntu en cabeceras.
colors:
  indigo-papaya: "#3f51b5"
  azul-barra: "#007bff"
  rosa-acento: "#ff4081"
  verde-disponible: "#43a047"
  verde-confirmar: "#00c853"
  ambar-poco-stock: "#ffb300"
  rojo-error: "#f44336"
  rosa-agotado: "#d81b60"
  tinta: "#212121"
  tinta-suave: "#424242"
  gris-texto: "#616161"
  gris-meta: "#757575"
  gris-borde: "#e0e0e0"
  gris-fondo: "#eeeeee"
  gris-chip: "#bdbdbd"
  blanco-lista: "#ffffff"
typography:
  headline:
    fontFamily: "Ubuntu-Regular, Ubuntu, 'Segoe UI', Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  detail:
    fontFamily: "Ubuntu-Light, Ubuntu, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 300
    lineHeight: 1.3
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  xs: "4px"
  sm: "5px"
  md: "8px"
  pill: "50%"
spacing:
  xs: "5px"
  sm: "8px"
  md: "15px"
components:
  button-primary:
    backgroundColor: "{colors.indigo-papaya}"
    textColor: "{colors.blanco-lista}"
    rounded: "{rounded.xs}"
    height: "36px"
    padding: "0 16px"
  button-confirm:
    backgroundColor: "{colors.verde-confirmar}"
    textColor: "{colors.blanco-lista}"
    rounded: "{rounded.xs}"
    height: "36px"
    padding: "0 16px"
  list-row:
    backgroundColor: "{colors.blanco-lista}"
    textColor: "{colors.tinta}"
    padding: "8px 15px"
  list-row-selected:
    backgroundColor: "{colors.gris-fondo}"
    rounded: "{rounded.sm}"
    padding: "12px"
  section-bar:
    backgroundColor: "{colors.azul-barra}"
    textColor: "{colors.blanco-lista}"
    height: "40px"
    padding: "0 15px"
  chip-required:
    backgroundColor: "{colors.gris-borde}"
    textColor: "{colors.tinta-suave}"
    rounded: "{rounded.md}"
    padding: "3px 6px"
  badge-count:
    backgroundColor: "{colors.rojo-error}"
    textColor: "{colors.gris-fondo}"
    rounded: "{rounded.pill}"
    padding: "2px 6px"
---

# Design System: Papaya App Mozo

## 1. Overview

**Creative North Star: "La comanda de papel, pero que no falla"**

La app hereda la lógica de la comanda: una lista vertical de platos con precio a la derecha, secciones como separadores, y el mozo marcando cantidades. Todo es plano, blanco sobre gris claro, con un solo color de marca (índigo) en la cabecera y en la acción principal. Nada flota, nada brilla, nada se anima para lucirse. La cordialidad se expresa en textos directos y en el verde de "listo, enviado", no en ornamentos.

La densidad es alta a propósito: filas de 48 a 60px, tipografía de 14px, márgenes de 15px. Un mozo ve entre 8 y 10 platos por pantalla sin desplazarse. El sistema rechaza explícitamente el look de app de delivery (tarjetas con foto, chips por todos lados) y el tema Material 3 que cambió el diseño en una actualización previa y fue descartado.

**Key Characteristics:**
- Listas planas con divisores de 1px, sin tarjetas.
- Un color de marca (índigo) y colores de estado con significado fijo.
- Ubuntu solo en cabeceras y descripciones; el cuerpo usa la pila del sistema (Bootstrap).
- Radios pequeños (4 a 8px), sin sombras salvo en diálogos.
- Controles grandes para el pulgar: cantidad, enviar, mesa.

## 2. Colors

Un índigo de marca sobre grises Material, y cuatro colores de estado que siempre significan lo mismo.

### Primary
- **Índigo Papaya** (#3f51b5): cabecera principal, pestañas, botón de acción primaria, texto de precio o cantidad destacado. Es el único color "de marca" en pantalla.
- **Azul de barra** (#007bff): barra de sección ("LA CARTA / ALITAS DE CASA") y algunos botones heredados de Bootstrap. Convive con el índigo; no introducir un tercer azul.

### Secondary
- **Rosa de acento** (#ff4081): subrayado de la pestaña activa, herencia del tema indigo-pink de Angular Material. Solo ahí.

### Tertiary (estados)
- **Verde disponible** (#43a047): franja o fondo de item disponible o pedido listo.
- **Verde confirmar** (#00c853): botón de enviar o confirmar cuando está habilitado.
- **Ámbar poco stock** (#ffb300): aviso de stock bajo, pedidos en espera.
- **Rojo error** (#f44336): contador de items del carrito, errores, mensajes de conexión.
- **Rosa agotado** (#d81b60): franja o fondo de item agotado o pedido cancelado.

### Neutral
- **Tinta** (#212121) y **Tinta suave** (#424242): texto principal y nombres de plato.
- **Gris texto** (#616161) y **Gris meta** (#757575): descripciones, metadatos, texto secundario.
- **Gris borde** (#e0e0e0): divisores de fila, bordes de contenedores seleccionados, fondo de chips.
- **Gris fondo** (#eeeeee): fondo de página detrás de las listas, cabecera de diálogos, fila seleccionada.
- **Gris chip** (#bdbdbd): bordes de imagen circular, botón de cerrar diálogo.
- **Blanco de lista** (#ffffff): fondo de cada fila y de los diálogos.

### Named Rules
**La regla del semáforo.** Verde, ámbar y rojo/rosa son estados, nunca decoración. Si un elemento lleva uno de esos colores, el mozo debe poder decir qué significa sin leer.

**La regla del único azul de marca.** El índigo es la marca. El azul Bootstrap se tolera donde ya existe; ningún componente nuevo lo usa.

## 3. Typography

**Display Font:** Ubuntu-Regular (fallback Ubuntu, Segoe UI, Roboto)
**Body Font:** pila del sistema de Bootstrap (-apple-system, Segoe UI, Roboto, Helvetica Neue, Arial)
**Detail Font:** Ubuntu-Light (descripciones de plato y de item)

**Character:** Ubuntu da la voz de marca en cabeceras y en las descripciones ligeras; el cuerpo es neutro y de sistema para renderizar rápido y leerse igual en cualquier Android o iPhone.

### Hierarchy
- **Headline** (400, 20px, 1.2): nombre del local en la cabecera, títulos de diálogo.
- **Title** (600, 14px, 1.25): nombre de plato y de sección. Mayúsculas solo si el dato viene así del POS.
- **Body** (400, 14px, 1.4): precios, opciones, textos de formulario. Los precios llevan peso 600 y van alineados a la derecha.
- **Detail** (Ubuntu-Light 300, 13px, 1.3): descripción del plato bajo el nombre, máximo 2 líneas con elipsis.
- **Label** (600, 12px, 1.2): etiquetas de estado ("Obligatorio", "Agotado"), contadores, metadatos.

### Named Rules
**La regla de los 14.** Nombre de plato y precio nunca bajan de 14px. Lo que baja a 12px es información que el mozo puede ignorar sin equivocarse.

## 4. Elevation

Sistema plano. La profundidad se comunica con capas tonales: página en gris fondo (#eeeeee), filas en blanco, fila seleccionada de vuelta en gris fondo con borde de 1px. Las sombras existen solo en los diálogos modales (Material) y en tres contenedores sueltos con `0 2px 8px rgba(0,0,0,0.1)`.

### Shadow Vocabulary
- **Diálogo** (Material `mat-dialog`, fondo oscurecido `rgba(0,0,0,0.52)`): único uso legítimo de sombra fuerte.
- **Contenedor flotante** (`box-shadow: 0 2px 8px rgba(0,0,0,0.1)`): pie de pedido y paneles que se superponen a la lista. Uso excepcional.

### Named Rules
**La regla de la lista plana.** Las filas de la carta y del pedido no llevan sombra, ni en reposo ni al tocar. El feedback de toque es cambio de fondo a gris fondo.

## 5. Components

### Buttons
- **Shape:** esquinas apenas redondeadas (4px), altura 36px, Material `mat-flat-button`.
- **Primary:** índigo Papaya con texto blanco, peso 500, 14px, sin mayúsculas forzadas.
- **Confirm:** verde confirmar con texto blanco; se usa para "Enviar" y "Listo". Deshabilitado: gris borde con texto gris meta.
- **Hover / Focus:** sin elevación; oscurecer el fondo un paso.
- **Texto / Ghost:** botones de texto en índigo para acciones secundarias ("Cancelar", "Ver cuenta").

### Chips
- **Style:** fondo gris borde, texto tinta suave, radio 8px, 12px, padding 3px 6px. Ejemplo: "Obligatorio" en el detalle de item.
- **State:** no hay chips seleccionables; los filtros son pestañas o listas.

### Cards / Containers
- **Corner Style:** 5px en contenedores seleccionados; 8px en paneles de pago.
- **Background:** blanco sobre gris fondo. Seleccionado: gris fondo con borde gris borde de 1px.
- **Shadow Strategy:** ninguna (ver Elevation).
- **Border:** divisores inferiores de 1px gris borde entre filas.
- **Internal Padding:** 8px vertical, 15px horizontal.

### Inputs / Fields
- **Style:** Material `mat-form-field` estándar (línea inferior), texto 14px.
- **Focus:** línea inferior en índigo.
- **Error / Disabled:** texto rojo error 12px bajo el campo; deshabilitado en gris meta.

### Navigation
- **Cabecera:** índigo Papaya, nombre del local en Ubuntu 20px, iconos Font Awesome blancos a la derecha (menú, buscar, refrescar, cerrar).
- **Pestañas:** Material `mat-tab`, texto blanco 14px peso 500, subrayado rosa acento de 2px; tres pestañas fijas: Carta, Mi pedido (con icono de canasta), Mesas.
- **Barra de sección:** azul barra, 40px, texto blanco 16px con ruta "LA CARTA / SECCIÓN" y flecha de volver a la derecha.
- **Mobile:** la cabecera se oculta al desplazar la lista (animación de 0.3s ease-out) para ganar espacio.

### Fila de carta (componente firma)
Fila blanca de 48 a 60px: a la izquierda imagen circular de 50px con borde gris chip (solo si existe foto), nombre del plato en 14px peso 600 con descripción en Ubuntu-Light 13px debajo, precio a la derecha en 14px peso 600. Estado por franja izquierda de 5px: verde disponible, ámbar poco stock, rosa agotado (con nombre tachado y precio en rojo). Control de cantidad − / + en botones de 32 a 44px con contador entre ambos.

### Detalle de item (diálogo)
Cabecera gris fondo de 15px de padding con nombre y botón de cerrar (gris chip al 70%). Cuerpo con grupos de opciones: título del grupo en 14px peso 600, regla ("Solo 1", "Hasta 1") en gris meta 12px, chip "Obligatorio" a la derecha. Opciones como filas con checkbox Material, nombre y stock o recargo a la derecha. Pie fijo con botón "Listo, continuar" en índigo y total en 20px peso 600.

## 6. Do's and Don'ts

### Do:
- **Do** mantener la lista plana: fondo blanco, divisor de 1px gris borde (#e0e0e0), sin sombra, sin radio en las filas.
- **Do** usar índigo Papaya (#3f51b5) para una sola acción principal por pantalla y verde confirmar (#00c853) para enviar.
- **Do** respetar 14px mínimo en nombres y precios, y 44px mínimo en cualquier control que se toque más de una vez por pedido.
- **Do** acompañar cada color de estado con texto o tachado ("Agotado", "Quedan 3"), nunca solo el color.
- **Do** dejar las pestañas Carta / Mi pedido / Mesas y el botón de enviar donde están.

### Don't:
- **Don't** parecer una app de delivery para clientes: nada de tarjetas grandes con foto, chips por todos lados ni pantallas de "descubrir".
- **Don't** adoptar el tema Material 3 ni cambiar el tema indigo-pink; la actualización previa cambió el diseño y fue rechazada.
- **Don't** agregar chrome: ninguna barra, cabecera o panel nuevo entre el mozo y la lista de platos.
- **Don't** decorar: sin degradados, sin texto con gradiente, sin vidrio esmerilado, sin animaciones de entrada.
- **Don't** introducir franjas laterales nuevas. Las franjas de 5px existentes son el vocabulario de estado de stock y se conservan; cualquier estado nuevo se expresa con fondo tintado y etiqueta.
- **Don't** usar un tercer azul ni un segundo verde fuera de los definidos.
