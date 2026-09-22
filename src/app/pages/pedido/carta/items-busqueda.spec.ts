import { itemsBusquedaDesdeCarta } from './items-busqueda';

describe('itemsBusquedaDesdeCarta', () => {
  const nuevaCarta = () => [{
    secciones: [{ des: 'Bebidas', idimpresora: 3, sec_orden: 1, ver_stock_cero: 0, items: [
      { idcarta_lista: 7, des: 'CHICHA VASO' },
      { idcarta_lista: 8, des: 'JARRA CHICHA' },
    ]}],
  }];

  it('recargar la carta no duplica items (antes salia CHICHA VASO 4 veces)', () => {
    itemsBusquedaDesdeCarta(nuevaCarta());
    const lista = itemsBusquedaDesdeCarta(nuevaCarta());
    expect(lista.length).toBe(2);
  });

  it('devuelve los mismos objetos de la carta actual, no copias', () => {
    const carta = nuevaCarta();
    const lista = itemsBusquedaDesdeCarta(carta);
    // el pedido rapido escribe itemtiposconsumo en el item de la busqueda;
    // el resumen lo lee desde la carta: tienen que ser el mismo objeto o el dialog abre en blanco
    lista[0].itemtiposconsumo = [{ idtipo_consumo: 1 }];
    expect(carta[0].secciones[0].items[0]).toBe(lista[0]);
    expect((carta[0].secciones[0].items[0] as any).itemtiposconsumo.length).toBe(1);
  });

  it('copia datos de la seccion y deja el item visible', () => {
    const [item] = itemsBusquedaDesdeCarta(nuevaCarta());
    expect(item.seccion).toBe('Bebidas');
    expect(item.idimpresora).toBe(3);
    expect(item.visible).toBeTrue();
  });

  it('tolera carta vacia o secciones sin items', () => {
    expect(itemsBusquedaDesdeCarta(null)).toEqual([]);
    expect(itemsBusquedaDesdeCarta([{ secciones: [{ des: 'x', items: null }] }])).toEqual([]);
  });
});
