import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { Observable, of, Subject } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { CrudHttpService } from './crud-http.service';
import { InfoTockenService } from './info-token.service';
import { IS_NATIVE } from '../config/config.const';

// Push FCM para la app mozo nativa: "mesa X solicita atencion".
// El backend (mozo/push-token) guarda el token por dispositivo y solo envia
// a los que conectaron el socket en las ultimas 24h.
// ponytail: solo nativo (Android/iOS); el web push VAPID de clientes quedo en git si se necesita.
const CANAL_LLAMADO_MESA = 'llamado_mesa'; // mismo id que usa el backend en android.notification.channelId

@Injectable({
  providedIn: 'root'
})
export class NotificacionPushService {

  private fcmToken = '';
  private idusuarioRegistrado = 0;
  private listenersOn = false;

  // push "pedido/plato listo" recibido con la app abierta (Android no lo muestra en primer plano):
  // lo pinta la tarjeta "Pedido Listo" de comp-list-call-client
  pedidoListo$ = new Subject<{ idpedido: string; idpedido_detalle: string; ref: string; plato: string }>();

  constructor(
    private crudService: CrudHttpService,
    private infoTokenService: InfoTockenService,
    private zone: NgZone,
  ) { }

  // se llama cada vez que el mozo conecta el socket (login, reconexion, cambio de usuario)
  registrarMozo(): void {
    if (!IS_NATIVE || !this.idusuarioActual()) { return; }
    if (this.fcmToken) { this.guardarToken(); return; } // ya registrado en FCM: solo re-asocia al usuario actual

    this.addListeners();
    PushNotifications.requestPermissions()
      .then(result => {
        if (result.receive === 'granted') { PushNotifications.register(); }
      })
      .catch(err => console.error('push requestPermissions', err));
  }

  // al cerrar sesion: el dispositivo deja de recibir llamados. Nunca bloquea el logout.
  eliminarRegistroMozo(): Observable<any> {
    if (!this.fcmToken) { return of(null); }
    const data = { fcm_token: this.fcmToken, idusuario: this.idusuarioRegistrado, op: 'del' };
    this.idusuarioRegistrado = 0;
    return this.crudService.postFree(data, 'mozo', 'push-token').pipe(
      timeout(3000),
      catchError(err => { console.error('push eliminar token', err); return of(null); })
    );
  }

  private addListeners(): void {
    if (this.listenersOn) { return; }
    this.listenersOn = true;

    // Android: canal con prioridad alta (heads-up) y vibracion. Sin `sound` usa el tono de
    // notificacion del sistema (`sound` espera un archivo en res/raw). En iOS no existe y se ignora.
    PushNotifications.createChannel({
      id: CANAL_LLAMADO_MESA,
      name: 'Llamado de mesa',
      description: 'Un cliente solicita atención en su mesa',
      importance: 5,
      vibration: true,
      visibility: 1,
    }).catch(() => { /* iOS: createChannel no implementado */ });

    PushNotifications.addListener('registration', (token: Token) => {
      this.fcmToken = token.value;
      this.guardarToken();
    });

    // falta google-services.json / APNs: se registra en consola, no se molesta al mozo
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('push registrationError', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (n: PushNotificationSchema) => {
      const d = n.data || {};
      if (d.tipo !== 'pedido_listo') { return; } // el llamado de mesa ya llega por socket con la app abierta
      // el callback del plugin corre fuera de Angular: sin zone.run la tarjeta no se pinta hasta el siguiente click
      this.zone.run(() => this.pedidoListo$.next({
        idpedido: String(d.idpedido || ''),
        idpedido_detalle: String(d.idpedido_detalle || '0'),
        ref: String(d.ref || ''),
        plato: String(d.plato || ''),
      }));
    });
  }

  private guardarToken(): void {
    const idusuario = this.idusuarioActual();
    if (!this.fcmToken || !idusuario || idusuario === this.idusuarioRegistrado) { return; }

    const data = {
      fcm_token: this.fcmToken,
      idusuario,
      plataforma: Capacitor.getPlatform(),
      op: 'set',
    };
    this.crudService.postFree(data, 'mozo', 'push-token').subscribe({
      next: () => this.idusuarioRegistrado = idusuario,
      error: err => console.error('push guardar token', err),
    });
  }

  private idusuarioActual(): number {
    const info = this.infoTokenService.infoUsToken;
    if (!info || info.isCliente) { return 0; }
    return Number(info.idusuario) || 0;
  }
}
