import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IS_TAURI } from '../config/config.const';

const CADA_MS = 30 * 60 * 1000; // vuelve a buscar cada 30 minutos

// Actualizacion automatica de la app de escritorio (Tauri): los comandos estan en src-tauri/src/lib.rs.
// En celular y web no hace nada.
@Injectable({ providedIn: 'root' })
export class ActualizacionEscritorioService {
  // version nueva disponible; null = al dia
  readonly versionNueva$ = new BehaviorSubject<string | null>(null);
  readonly instalando$ = new BehaviorSubject<boolean>(false);
  readonly error$ = new BehaviorSubject<string>('');

  private iniciado = false;

  constructor(private zone: NgZone) { }

  iniciar(): void {
    if (!IS_TAURI || this.iniciado) { return; }
    this.iniciado = true;
    this.buscar();
    this.zone.runOutsideAngular(() => setInterval(() => this.buscar(), CADA_MS));
  }

  private buscar(): void {
    this.invoke('buscar_actualizacion')
      .then((version: string | null) => this.zone.run(() => this.versionNueva$.next(version || null)))
      .catch(() => { /* sin internet o sin JSON publicado: se reintenta en la proxima vuelta */ });
  }

  // descarga, instala y reinicia la app
  instalar(): void {
    if (this.instalando$.value) { return; }
    this.instalando$.next(true);
    this.error$.next('');
    this.invoke('instalar_actualizacion').catch((e: any) => this.zone.run(() => {
      this.instalando$.next(false);
      this.error$.next('No se pudo actualizar. Revise su conexión e intente de nuevo.');
      console.error('actualizacion', e);
    }));
  }

  private invoke(cmd: string): Promise<any> {
    return (window as any).__TAURI_INTERNALS__.invoke(cmd);
  }
}
