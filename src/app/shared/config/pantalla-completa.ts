import { IS_TAURI } from './config.const';

// Pantalla completa como F11. En la app de escritorio (Tauri) se usa la ventana nativa
// (la Fullscreen API del webview no agranda la ventana); en navegador, la Fullscreen API.
// ponytail: invoke directo en vez de @tauri-apps/api, es lo mismo que hace ese paquete por dentro
const tauri = (): any => (window as any).__TAURI_INTERNALS__;

export async function esPantallaCompleta(): Promise<boolean> {
  if (IS_TAURI) { return !!(await tauri().invoke('plugin:window|is_fullscreen', { label: 'main' })); }
  return !!document.fullscreenElement;
}

export async function ponerPantallaCompleta(completa: boolean): Promise<boolean> {
  if (IS_TAURI) {
    await tauri().invoke('plugin:window|set_fullscreen', { label: 'main', value: completa });
  } else if (completa && !document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else if (!completa && document.fullscreenElement) {
    await document.exitFullscreen();
  }
  if (completa) { avisoComoSalir(); }
  return completa;
}

// devuelve el estado nuevo
export async function alternarPantallaCompleta(): Promise<boolean> {
  return ponerPantallaCompleta(!(await esPantallaCompleta()));
}

// toast desde arriba: "Presiona F11 para salir de pantalla completa" (DOM directo: sirve desde cualquier pantalla)
function avisoComoSalir(): void {
  const ID = 'aviso-pantalla-completa';
  document.getElementById(ID)?.remove();

  const toast = document.createElement('div');
  toast.id = ID;
  const tecla = document.createElement('span');
  tecla.textContent = 'F11';
  Object.assign(tecla.style, {
    display: 'inline-block', margin: '0 6px', padding: '2px 8px', borderRadius: '6px',
    border: '1px solid rgba(255,255,255,.6)', fontWeight: '600', fontSize: '14px',
  });
  toast.append('Presiona', tecla, 'para salir de pantalla completa');
  Object.assign(toast.style, {
    position: 'fixed', top: '18px', left: '50%', zIndex: '2000', pointerEvents: 'none',
    transform: 'translate(-50%, -150%)', opacity: '0', transition: 'transform .3s ease, opacity .3s ease',
    background: 'rgba(33, 33, 33, .92)', color: '#fff', padding: '12px 22px', borderRadius: '26px',
    fontFamily: 'inherit', fontSize: '15px', boxShadow: '0 8px 24px rgba(0, 0, 0, .3)', whiteSpace: 'nowrap',
  });
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translate(-50%, 0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translate(-50%, -150%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}
