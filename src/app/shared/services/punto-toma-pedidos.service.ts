import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CrudHttpService } from './crud-http.service';
import { AuthServiceSotrage } from './auth.service';
import { InfoTockenService } from './info-token.service';
import { MipedidoService } from './mipedido.service';
import { StorageService } from './storage.service';
import { UsuarioAutorizadoModel } from 'src/app/modelos/usuario-autorizado.model';
import {
  leerConfigPuntoTomaPedidos, claveBorradorMozo, segundosParaCerrar, ConfigPuntoTomaPedidos,
} from '../config/punto-toma-pedidos';

export interface MozoPunto { idusuario: number; nombres: string; usuario: string; }

export interface EstadoPunto {
  bloqueado: boolean;   // se muestra la pantalla de seleccion de mozo
  cancelable: boolean;  // "Cambiar usuario": se puede volver al mozo actual sin entrar
}

const KEY_MOZO_SESION = 'sys::punto::mozo';
const KEY_LISTA_MOZOS = 'sys::list-mozos'; // la misma cache que usa dialog-change-user
const EVENTOS_ACTIVIDAD = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'mousemove'];

@Injectable({ providedIn: 'root' })
export class PuntoTomaPedidosService implements OnDestroy {
  readonly config: ConfigPuntoTomaPedidos = leerConfigPuntoTomaPedidos(localStorage.getItem('sys::punto'));

  private estadoSource = new BehaviorSubject<EstadoPunto>({ bloqueado: this.config.activo, cancelable: false });
  readonly estado$ = this.estadoSource.asObservable();

  // segundos que faltan para cerrar por inactividad; null = sin aviso
  private avisoSource = new BehaviorSubject<number | null>(null);
  readonly aviso$ = this.avisoSource.asObservable();

  private mozoSource = new BehaviorSubject<string>('');
  readonly nombreMozo$ = this.mozoSource.asObservable();

  private ultimaActividad = Date.now();
  private timer: any = null;
  private readonly marcarActividad = () => { this.ultimaActividad = Date.now(); };

  constructor(
    private zone: NgZone,
    private crudService: CrudHttpService,
    private authService: AuthServiceSotrage,
    private infoToken: InfoTockenService,
    private miPedidoService: MipedidoService,
    private storageService: StorageService,
  ) { }

  get activo(): boolean { return this.config.activo; }

  // la llama el main del pedido; no hace nada si el punto no esta activo
  iniciar(): void {
    if (!this.config.activo || this.timer) { return; }
    this.zone.runOutsideAngular(() => {
      EVENTOS_ACTIVIDAD.forEach(e => document.addEventListener(e, this.marcarActividad, { passive: true }));
      this.timer = setInterval(() => this.revisarInactividad(), 1000);
    });
  }

  ngOnDestroy(): void {
    EVENTOS_ACTIVIDAD.forEach(e => document.removeEventListener(e, this.marcarActividad));
    clearInterval(this.timer);
  }

  private revisarInactividad(): void {
    if (this.estadoSource.value.bloqueado) {
      if (this.avisoSource.value !== null) { this.zone.run(() => this.avisoSource.next(null)); }
      return;
    }
    const faltan = segundosParaCerrar(Date.now() - this.ultimaActividad, this.config.segundosInactividad);
    if (faltan === this.avisoSource.value) { return; }
    this.zone.run(() => {
      if (faltan === 0) { this.cerrarSesion(); return; }
      this.avisoSource.next(faltan);
    });
  }

  seguirTrabajando(): void {
    this.marcarActividad();
    this.avisoSource.next(null);
  }

  cambiarUsuario(): void {
    this.estadoSource.next({ bloqueado: true, cancelable: true });
  }

  volverAlMozoActual(): void {
    this.marcarActividad();
    this.estadoSource.next({ bloqueado: false, cancelable: false });
  }

  // el pedido a medias queda guardado para el mozo que sale
  cerrarSesion(): void {
    this.guardarBorrador(this.idMozoSesion());
    localStorage.removeItem(KEY_MOZO_SESION);
    this.avisoSource.next(null);
    this.estadoSource.next({ bloqueado: true, cancelable: false });
  }

  // cargo = false: no se pudo traer (sin red o token vencido) y se usa la ultima lista conocida
  listarMozos(): Observable<{ mozos: MozoPunto[]; cargo: boolean }> {
    const cache: MozoPunto[] = this.leerJson(KEY_LISTA_MOZOS) || [];
    return this.crudService.getAll('pedido', 'get-user-mozo-change-user', false, false).pipe(
      map((res: any) => {
        const mozos: MozoPunto[] = res?.data || [];
        localStorage.setItem(KEY_LISTA_MOZOS, JSON.stringify(mozos));
        return { mozos, cargo: true };
      }),
      catchError(() => of({ mozos: cache, cargo: false })),
    );
  }

  // devuelve null si entro, o el mensaje de error
  entrar(mozo: MozoPunto, clave: string): Observable<string | null> {
    const usuario = new UsuarioAutorizadoModel();
    usuario.nomusuario = mozo.usuario;
    usuario.pass = clave;
    return this.authService.getUserLogged(usuario).pipe(
      map((res: any) => {
        if (!res?.success) { return res?.error || 'Clave incorrecta'; }
        this.aplicarSesion(mozo, usuario, res.token);
        return null;
      }),
      catchError(() => of('Sin conexión con el servidor. Intente de nuevo.')),
    );
  }

  // sin token: el backend valida usuario + clave actual (con limite de intentos)
  cambiarClave(usuario: string, claveActual: string, claveNueva: string): Observable<string | null> {
    const datos = { usuario, clave_actual: claveActual, clave_nueva: claveNueva };
    return this.crudService.postFree(datos, 'mozo', 'cambiar-clave', false).pipe(
      map((res: any) => res?.success ? null : (res?.error || 'No se pudo cambiar la clave')),
      catchError((err) => of(err?.error?.error || 'No se pudo cambiar la clave')),
    );
  }

  // mismo cambio de sesion que dialog-change-user, mas el borrador por mozo
  private aplicarSesion(mozo: MozoPunto, usuario: UsuarioAutorizadoModel, token: string): void {
    const idAnterior = this.idMozoSesion();
    const esOtroMozo = idAnterior !== mozo.idusuario;
    if (esOtroMozo) { this.guardarBorrador(idAnterior); }

    this.authService.setLocalToken(token);
    this.authService.setLocalTokenAuth(token);
    this.authService.setLoggedStatus(true);
    this.authService.setLocalUsuario(usuario);
    this.infoToken.changeUserMozo(mozo);
    this.infoToken.setIsUsuarioAutorizacion(true);
    localStorage.setItem(KEY_MOZO_SESION, String(mozo.idusuario));

    if (esOtroMozo) { this.restaurarBorrador(mozo.idusuario); }

    this.mozoSource.next(mozo.nombres);
    this.marcarActividad();
    this.estadoSource.next({ bloqueado: false, cancelable: false });
  }

  private idMozoSesion(): number | null {
    const id = Number(localStorage.getItem(KEY_MOZO_SESION));
    return id > 0 ? id : null;
  }

  // aparta el pedido sin enviar (no devuelve el stock: sigue reservado para ese mozo)
  private guardarBorrador(idusuario: number | null): void {
    if (!idusuario || !this.storageService.isExistKey('sys::order')) { return; }
    localStorage.setItem(claveBorradorMozo(idusuario), JSON.stringify({
      order: this.storageService.get('sys::order'),
      all: this.storageService.get('sys::order::all'),
    }));
    this.miPedidoService.prepareNewPedido();
  }

  private restaurarBorrador(idusuario: number): void {
    const borrador = this.leerJson(claveBorradorMozo(idusuario));
    localStorage.removeItem(claveBorradorMozo(idusuario));
    if (!borrador?.order) { return; }
    this.storageService.set('sys::order', borrador.order);
    this.storageService.set('sys::order::all', borrador.all);
    this.miPedidoService.updatePedidoFromStrorage();
  }

  private leerJson(key: string): any {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
}
