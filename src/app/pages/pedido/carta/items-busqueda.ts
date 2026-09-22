// Lista plana de items para la busqueda. Devuelve los MISMOS objetos de la carta (no copias):
// el pedido rapido guarda itemtiposconsumo sobre el item y el resumen lo vuelve a buscar en la carta.
// Siempre se arma desde cero; si se acumula, quedan items de cartas anteriores (duplicados y desconectados).
export function itemsBusquedaDesdeCarta(carta: any[]): any[] {
  const items = [];
  (carta || []).forEach((c: any) => {
    (c.secciones || []).forEach((s: any) => {
      (s.items || []).forEach((i: any) => {
        i.seccion = s.des;
        i.idimpresora = s.idimpresora;
        i.sec_orden = s.sec_orden;
        i.ver_stock_cero = s.ver_stock_cero;
        i.selected = false;
        i.visible = true;
        items.push(i);
      });
    });
  });
  return items;
}
