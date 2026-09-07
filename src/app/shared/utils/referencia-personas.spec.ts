import { armarReferencia } from './referencia-personas';

describe('armarReferencia', () => {
  it('sin personas devuelve la referencia tal cual', () => {
    expect(armarReferencia('DR VALDES', '')).toBe('DR VALDES');
    expect(armarReferencia('DR VALDES', null)).toBe('DR VALDES');
    expect(armarReferencia('DR VALDES', '0')).toBe('DR VALDES');
  });

  it('sin referencia devuelve solo las personas', () => {
    expect(armarReferencia('', '4')).toBe('4 PERS');
    expect(armarReferencia('   ', 2)).toBe('2 PERS');
  });

  it('anexa las personas a la referencia', () => {
    expect(armarReferencia('DR VALDES', '4')).toBe('DR VALDES | 4 PERS');
  });

  it('nunca supera los 50 caracteres y conserva el sufijo', () => {
    const larga = 'CUMPLEANOS DE LA SENORA MARTINEZ MESA DEL FONDO JUNTO A LA VENTANA';
    const r = armarReferencia(larga, '12');
    expect(r.length).toBeLessThanOrEqual(50);
    expect(r.endsWith(' | 12 PERS')).toBeTrue();
    expect(armarReferencia(larga, '').length).toBe(50);
  });
});
