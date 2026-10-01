import { Component, HostListener, OnInit } from '@angular/core';
import { IS_NATIVE, IS_TAURI } from './shared/config/config.const';
import { alternarPantallaCompleta, ponerPantallaCompleta } from './shared/config/pantalla-completa';
import { leerConfigPuntoTomaPedidos } from './shared/config/punto-toma-pedidos';
import { ActualizacionEscritorioService } from './shared/services/actualizacion-escritorio.service';
// import { SwUpdate } from '@angular/service-worker';
// import { ActivatedRoute } from '@angular/router';
// import { App } from '@capacitor/app';
// import { Auth0Service } from './shared/services/auth0.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // title = 'pwa-app-pedido';

  suscribe: any;
  constructor(
    private actualizacion: ActualizacionEscritorioService,
    // private swUpdate: SwUpdate
    // private auth: Auth0Service
    // public plataform: Plataform
    // private activatedRoute: ActivatedRoute
  ) {

    // const nomsede = this.activatedRoute.snapshot.params.nomsede;
    // console.log('parametro url', nomsede); // OUTPUT 1534
    // this.suscribe = this.plataform.

    // App.addListener('backButton', () => {
    //   // App.exitApp();
    //   console.log('boton atras app');
    // });

  }

  // app de escritorio: F11 pone la ventana en pantalla completa, en cualquier pantalla (login, punto, pedido)
  @HostListener('document:keydown', ['$event'])
  onTecla(e: KeyboardEvent) {
    if (!IS_TAURI || e.key !== 'F11') { return; }
    e.preventDefault();
    alternarPantallaCompleta().catch(() => {});
  }

  ngOnInit() {
    this.actualizacion.iniciar(); // app de escritorio: avisa si hay version nueva (en celular/web no hace nada)

    // punto de toma de pedidos en la app de escritorio: arranca en pantalla completa
    if (IS_TAURI && leerConfigPuntoTomaPedidos(localStorage.getItem('sys::punto')).activo) {
      ponerPantallaCompleta(true).catch(() => {});
    }

    // app nativa: da de baja el service worker de versiones anteriores para que cada actualizacion cargue al primer arranque
    if ((IS_NATIVE || IS_TAURI) && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => {});
    }
    // if (this.swUpdate.isEnabled) {
    //   this.swUpdate.available.subscribe(() => {
    //       console.log('nueva version');
    //       window.location.reload();
    //   });
    // }
  }
}
