import {
  leerConfigPuntoTomaPedidos, esClaveNuevaValida, inicialesMozo, colorMozo, segundosParaCerrar, claveBorradorMozo, tokenVigente,
  activarPuntoTomaPedidos,
} from './punto-toma-pedidos';

describe('punto de toma de pedidos', () => {
  it('apagado por defecto: sin config, config vieja o JSON roto no cambia nada', () => {
    expect(leerConfigPuntoTomaPedidos(null).activo).toBeFalse();
    expect(leerConfigPuntoTomaPedidos('{"istoma_pedido_rapido":true,"ispunto_autopedido":false}').activo).toBeFalse();
    expect(leerConfigPuntoTomaPedidos('{roto').activo).toBeFalse();
  });

  it('lee la opcion y los segundos; 30 por defecto y 0 = nunca', () => {
    expect(leerConfigPuntoTomaPedidos('{"ispunto_toma_pedidos":true}')).toEqual({ activo: true, segundosInactividad: 30 });
    expect(leerConfigPuntoTomaPedidos('{"ispunto_toma_pedidos":true,"segundos_inactividad":0}').segundosInactividad).toBe(0);
    expect(leerConfigPuntoTomaPedidos('{"segundos_inactividad":-5}').segundosInactividad).toBe(30);
  });

  it('clave nueva: exactamente 4 digitos', () => {
    expect(esClaveNuevaValida('0427')).toBeTrue();
    expect(esClaveNuevaValida('427')).toBeFalse();
    expect(esClaveNuevaValida('12345')).toBeFalse();
    expect(esClaveNuevaValida('12a4')).toBeFalse();
    expect(esClaveNuevaValida(null)).toBeFalse();
  });

  it('iniciales del mozo', () => {
    expect(inicialesMozo('juan perez rios')).toBe('JP');
    expect(inicialesMozo('  maria ')).toBe('MA');
    expect(inicialesMozo('')).toBe('?');
  });

  it('color estable por mozo', () => {
    expect(colorMozo(7)).toBe(colorMozo(7));
    expect(colorMozo(undefined)).toBeTruthy();
  });

  it('aviso de cierre: los ultimos 10 segundos cuentan hacia atras', () => {
    expect(segundosParaCerrar(19000, 30)).toBeNull();
    expect(segundosParaCerrar(20000, 30)).toBe(10);
    expect(segundosParaCerrar(25500, 30)).toBe(5);
    expect(segundosParaCerrar(31000, 30)).toBe(0);
    expect(segundosParaCerrar(999999, 0)).toBeNull(); // nunca
    expect(segundosParaCerrar(4000, 15)).toBeNull(); // la opcion mas corta: 5 s libres y 10 de aviso
    expect(segundosParaCerrar(5000, 15)).toBe(10);
  });

  it('token vigente: por exp del JWT (la sesion vieja no debe dejar atrapado en la lista de mozos)', () => {
    const jwt = (exp: number) => `x.${btoa(JSON.stringify({ exp }))}.y`;
    const ahora = 1_800_000_000_000;
    expect(tokenVigente(jwt(ahora / 1000 + 3600), ahora)).toBeTrue();
    expect(tokenVigente(jwt(ahora / 1000 - 10), ahora)).toBeFalse();
    expect(tokenVigente(jwt(ahora / 1000 + 30), ahora)).toBeFalse(); // vence en menos de 1 minuto
    expect(tokenVigente(null)).toBeFalse();
    expect(tokenVigente('basura')).toBeFalse();
  });

  it('aceptar la invitacion activa el punto y conserva la configuracion existente', () => {
    const antes = '{"istoma_pedido_rapido":true,"canal_consumo":{"idtipo_consumo":1},"ispunto_autopedido":true}';
    const despues = JSON.parse(activarPuntoTomaPedidos(antes));
    expect(despues.ispunto_toma_pedidos).toBeTrue();
    expect(despues.ispunto_autopedido).toBeFalse();
    expect(despues.istoma_pedido_rapido).toBeTrue();
    expect(despues.canal_consumo).toEqual({ idtipo_consumo: 1 });
    expect(despues.segundos_inactividad).toBe(30);
    expect(leerConfigPuntoTomaPedidos(activarPuntoTomaPedidos(null)).activo).toBeTrue();
    expect(JSON.parse(activarPuntoTomaPedidos('{"segundos_inactividad":120}')).segundos_inactividad).toBe(120);
  });

  it('borrador separado por mozo', () => {
    expect(claveBorradorMozo(3)).not.toBe(claveBorradorMozo(4));
  });
});
