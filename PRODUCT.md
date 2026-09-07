# Product

## Register

product

## Users

Mozos y meseras de restaurantes que usan Papaya (POS Restobar). Trabajan de pie, con el celular en una mano y el cliente esperando frente a ellos. Rotación de personal alta: la app tiene que entenderse sin capacitación. Las condiciones de luz cambian según el local: salón interior, bar con poca luz, terraza con sol.

La tarea principal en cualquier pantalla es una sola: encontrar el plato, indicar cantidad y opciones, y enviar el pedido a cocina. Secundarias: ver la cuenta de una mesa, revisar pedidos en espera (holding), cobrar.

## Product Purpose

App nativa (Angular + Capacitor) para tomar pedidos en mesa y enviarlos a cocina en tiempo real por socket, integrada con POS Restobar y backend-pedidos. Existe para que el mozo no vaya a la caja ni escriba en papel.

Éxito: el pedido llega a cocina completo, una sola vez, en el menor número de toques posible, incluso con señal de internet lenta.

## Brand Personality

Amable y cercana: se siente parte de la marca Papaya, no una herramienta fría. Tres palabras: **cordial, clara, ágil**.

La app habla en español peruano directo ("Listo, continuar", "Enviar pedido"), sin jerga técnica. La cordialidad está en la claridad y en no hacer perder tiempo, no en adornos.

## Anti-references

- **No parecer app de delivery para clientes**: nada de tarjetas grandes con foto, chips por todos lados, promociones ni pantallas de "descubrir". El mozo ya sabe qué vende.
- **No adoptar el look de Angular Material nuevo (Material 3)**: la actualización previa cambió el diseño y fue rechazada. La identidad actual (índigo, listas planas, botones sobrios) se mantiene.
- **No agregar chrome**: cada barra, cabecera o panel extra antes de la lista de platos es un toque o un scroll más para el mozo.
- **No decorar**: sombras, degradados, animaciones de entrada o iconografía ilustrativa no aportan a tomar un pedido.

## Design Principles

1. **La lista de platos es la protagonista.** Todo lo demás cede espacio: cabeceras compactas, controles al borde, nada entre el mozo y el nombre del plato con su precio.
2. **Cada retoque quita fricción, no añade decoración.** Si un cambio visual no ahorra un toque, un scroll o una duda, no entra.
3. **Lo que ya funciona no se mueve de sitio.** Los mozos tienen memoria muscular: pestañas Carta / Mi pedido / Mesas, botón de enviar, selector de mesa. Se refinan, no se reubican.
4. **El color significa algo.** Verde = disponible o confirmar, rojo = agotado o error, índigo = acción principal. Nunca color como ornamento.
5. **Funciona con mala señal.** Los estados de carga, reintento y error son parte del diseño, no un caso raro.

## Accessibility & Inclusion

- Tema claro de alto contraste como base: debe leerse con sol directo y en un bar oscuro. No se planifica tema oscuro por ahora.
- Texto mínimo 14px para nombres de plato y precios; 12px solo para metadatos.
- Objetivos táctiles mínimos de 44px; los controles de cantidad (− / +) y "enviar" son los más usados y los más grandes.
- Estados de agotado y poco stock no dependen solo del color: van con etiqueta de texto o tachado.
- Sin animaciones necesarias para entender el estado; respetar `prefers-reduced-motion`.
