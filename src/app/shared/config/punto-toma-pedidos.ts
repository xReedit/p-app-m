// Punto de toma de pedidos: una computadora del local donde cada mozo entra con su clave a ingresar sus pedidos.
// Todo depende de sys::punto.ispunto_toma_pedidos (apagado por defecto): sin esa opcion la app no cambia en nada.

export const SEGUNDOS_INACTIVIDAD_DEFAULT = 30;
export const SEGUNDOS_AVISO_CIERRE = 10; // cuenta regresiva visible antes de cerrar la sesion por inactividad

export const OPCIONES_INACTIVIDAD = [
  { segundos: 15, texto: '15 segundos' },
  { segundos: 30, texto: '30 segundos' },
  { segundos: 60, texto: '1 minuto' },
  { segundos: 120, texto: '2 minutos' },
  { segundos: 300, texto: '5 minutos' },
  { segundos: 0, texto: 'Nunca' },
];

export interface ConfigPuntoTomaPedidos {
  activo: boolean;
  segundosInactividad: number; // 0 = no cierra por inactividad
}

export function leerConfigPuntoTomaPedidos(raw: string | null): ConfigPuntoTomaPedidos {
  let config: any = {};
  try { config = JSON.parse(raw || '{}') || {}; } catch (e) { config = {}; }
  const segundos = Number(config.segundos_inactividad);
  return {
    activo: config.ispunto_toma_pedidos === true,
    segundosInactividad: Number.isFinite(segundos) && segundos >= 0 ? segundos : SEGUNDOS_INACTIVIDAD_DEFAULT,
  };
}

// la invitacion "¿usar este equipo como punto de toma de pedidos?" sale una sola vez (app de escritorio).
// Prefijo sys::punto:: para que sobreviva al localStorage.clear() del login.
export const KEY_INVITACION_PUNTO_VISTA = 'sys::punto::invitacion-vista';

// sys::punto con el punto de toma de pedidos activo, conservando el resto de la configuracion
export function activarPuntoTomaPedidos(raw: string | null): string {
  let config: any = {};
  try { config = JSON.parse(raw || '{}') || {}; } catch (e) { config = {}; }
  const segundos = Number(config.segundos_inactividad);
  return JSON.stringify({
    ...config,
    ispunto_toma_pedidos: true,
    ispunto_autopedido: false, // autopedido es para clientes: no van juntos (igual que Configuraciones)
    segundos_inactividad: Number.isFinite(segundos) && segundos >= 0 ? segundos : SEGUNDOS_INACTIVIDAD_DEFAULT,
  });
}

// la clave nueva se teclea en el teclado numerico del punto
export function esClaveNuevaValida(clave: string): boolean {
  return /^\d{4}$/.test(clave || '');
}

export function inicialesMozo(nombre: string): string {
  const partes = (nombre || '').trim().split(/\s+/).filter(p => p);
  if (partes.length === 0) { return '?'; }
  const dos = partes.length === 1 ? partes[0].slice(0, 2) : partes[0][0] + partes[1][0];
  return dos.toUpperCase();
}

// mismo mozo, mismo color siempre
const COLORES_AVATAR = ['#5c6bc0', '#26a69a', '#ef6c00', '#8e24aa', '#00897b', '#d81b60', '#3949ab', '#6d4c41', '#0288d1', '#7cb342'];
export function colorMozo(idusuario: number): string {
  return COLORES_AVATAR[Math.abs(Number(idusuario) || 0) % COLORES_AVATAR.length];
}

export function claveBorradorMozo(idusuario: number): string {
  return `sys::punto::borrador::${idusuario}`;
}

// el JWT guardado sirve todavia? (con 1 minuto de margen). Sin exp se da por vigente; roto = vencido
export function tokenVigente(token: string | null, ahoraMs = Date.now()): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 > ahoraMs + 60000;
  } catch (e) {
    return false;
  }
}

// segundos que faltan para cerrar la sesion; null = todavia no toca avisar
export function segundosParaCerrar(msInactivo: number, segundosInactividad: number): number | null {
  if (!segundosInactividad) { return null; }
  const msAviso = Math.max(0, segundosInactividad - SEGUNDOS_AVISO_CIERRE) * 1000;
  if (msInactivo < msAviso) { return null; }
  return Math.max(0, Math.ceil((segundosInactividad * 1000 - msInactivo) / 1000));
}

// impresora de pre-cuenta de este equipo (solo punto de toma de pedidos). Se busca en la lista vigente de la sede
// para usar su IP actual; si no esta configurada o ya no existe devuelve null (se sigue con area / impresora de pre-cuenta).
export function impresoraPrecuentaPunto(raw: string | null, impresoras: any[]): any {
  let config: any = {};
  try { config = JSON.parse(raw || '{}') || {}; } catch (e) { config = {}; }
  const id = config.ispunto_toma_pedidos === true && config.impresora_precuenta ? Number(config.impresora_precuenta.idimpresora) : 0;
  if (!id || !Array.isArray(impresoras)) { return null; }
  return impresoras.find((i: any) => i && Number(i.idimpresora) === id) || null;
}
