// La cantidad de personas de la mesa viaja anexada a la referencia del pedido ("4 PERS"),
// asi sale en comanda y en control de mesas sin columna nueva. pedido.referencia es varchar(50).
export const MAX_REFERENCIA = 50;

export function armarReferencia(referencia: string, personas: string | number | null | undefined, max = MAX_REFERENCIA): string {
  const ref = (referencia || '').trim();
  const n = parseInt(String(personas ?? ''), 10);
  if (!(n > 0)) { return ref.slice(0, max); }

  const sufijo = `${n} PERS`;
  if (!ref) { return sufijo; }

  const sep = ' | ';
  const libre = max - sufijo.length - sep.length;
  return `${ref.slice(0, libre).trim()}${sep}${sufijo}`;
}
