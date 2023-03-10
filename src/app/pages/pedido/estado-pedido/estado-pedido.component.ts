import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';
import { EstadoPedidoModel } from 'src/app/modelos/estado.pedido.model';
import { EstadoPedidoClienteService } from 'src/app/shared/services/estado-pedido-cliente.service';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { UsuarioTokenModel } from 'src/app/modelos/usuario.token.model';
import { NavigatorLinkService } from 'src/app/shared/services/navigator-link.service';
import { SocketService } from 'src/app/shared/services/socket.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { EstablecimientoService } from 'src/app/shared/services/establecimiento.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { DatosFacturacionClienteComponent } from 'src/app/componentes/datos-facturacion-cliente/datos-facturacion-cliente.component';
// import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-estado-pedido',
  templateUrl: './estado-pedido.component.html',
  styleUrls: ['./estado-pedido.component.css']
})
export class EstadoPedidoComponent implements OnInit, OnDestroy {
  estadoPedido: EstadoPedidoModel;
  infoToken: UsuarioTokenModel;
  tiempoEspera: number;
  rippleColor = 'rgb(255,238,88, 0.5)';
  tituloMesa = 'Mesa';

  isViewMsjSolicitudPersoanl = false;
  isDeliveryCliente: boolean;
  isComercioAceptaTarjeta = false;

  private isBtnPagoShow = false; // si el boton de pago ha sido visible entonces recarga la pagina de pago

  // private unsubscribeEstado = new Subscription();
  private destroyEstado$: Subject<boolean> = new Subject<boolean>();

  simbolo_moneda: string;



  constructor(
    private listenStatusService: ListenStatusService,
    private estadoPedidoClienteService: EstadoPedidoClienteService,
    private infoTokenService: InfoTockenService,
    private navigatorService: NavigatorLinkService,
    private socketService: SocketService,
    private router: Router,
    private establecimientoService: EstablecimientoService,
    private dialogDatosFacturacion: MatDialog,
  ) { }

  ngOnInit() {

    // verificar en el localstorage
    this.infoToken = this.infoTokenService.getInfoUs();
    this.isDeliveryCliente = this.infoToken.isDelivery;

    // this.estadoPedidoClienteService.get();

    this.simbolo_moneda = this.establecimientoService.getSimboloMoneda();

    // console.log('this.establecimientoService', this.establecimientoService.get() );
    this.isComercioAceptaTarjeta = this.establecimientoService.get().pwa_delivery_acepta_tarjeta === 1;

    // escuchar cambios
    this.listenStatus();

  }

  ngOnDestroy(): void {
    // this.unsubscribeEstado.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();

    this.destroyEstado$.next(true);
    this.destroyEstado$.unsubscribe();
  }

  private listenStatus() {

    this.navigatorService.resNavigatorSourceObserve$
    .pipe(takeUntil(this.destroyEstado$))
    .subscribe((res: any) => {
      if (res.pageActive === 'estado') {
        this.tituloMesa = this.infoToken.isSoloLLevar ? 'Para Llevar' : 'Mesa';
        // if ( this.estadoPedido.importe > 0 ) {

          setTimeout(() => {
            this.estadoPedidoClienteService.getCuentaTotales();
          }, 2500);
        // }
      }
    });

    this.navigatorService.resNavigatorSourceObserve$
    .pipe(takeUntil(this.destroyEstado$))
    .subscribe(async (res: any) => {
      if (res.pageActive === 'estado') {

        const _importe = await this.estadoPedidoClienteService.getImporteCuenta();
        this.estadoPedido.importe = <number>_importe || 0;
        // this.estadoPedidoClienteService.getCuentaTotales();
      }
    });

    this.listenStatusService.hayPedidoPendiente$
      .pipe(takeUntil(this.destroyEstado$))
      .subscribe((res: boolean) => {
        this.estadoPedidoClienteService.setHayPedidoPendiente(res);
      });

    this.listenStatusService.estadoPedido$
    .pipe(takeUntil(this.destroyEstado$))
    .subscribe(res => {
      this.estadoPedido = res;


      // if ( _importe === 0 ) {
      if ( this.estadoPedido.importe === 0 && this.estadoPedido.isRegisterOnePago ) {
        // this.unsubscribeEstado.unsubscribe();
        this.estadoPedidoClienteService.setisRegisterPago(false);
        this.navigatorService._router('../lanzar-encuesta');
      }

      // recalcular cuenta si es 0 agradecimiento y lanzar encuesta si aun no la lleno
      // if (this.estadoPedido.isPagada) {
      //   this.navigatorService._router('../lanzar-encuesta');
      // }
    });

    // tiempo de espera
    this.estadoPedidoClienteService.timeRestanteAprox$.subscribe((res: any) => {
      this.tiempoEspera = res;

    });

    this.socketService.onPedidoPagado()
    .pipe(takeUntil(this.destroyEstado$))
    .subscribe(res => {

      // recalcular cuenta si es 0 agradecimiento y lanzar encuesta si aun no la lleno
      this.estadoPedidoClienteService.getCuentaTotales();
      this.estadoPedidoClienteService.setisRegisterPago(true);
    });

    this.listenStatusService.isBtnPagoShow$
    .pipe(takeUntil(this.destroyEstado$))
    .subscribe((res: boolean) => { this.isBtnPagoShow = res; });
  }

  verCuenta() {

    this.estadoPedidoClienteService.getCuenta();
    this.navigatorService.setPageActive('mipedido');
  }

  pagarCuenta() {
    // this.navigatorService._router('./pagar-cuenta');
    if ( !localStorage.getItem('sys::st') ) {
      this.verCuenta();
      return;
    }

    this.estadoPedidoClienteService.getCuenta(); // get subtotales - esta listen resumen-pedido;
    this.router.navigate(['./pagar-cuenta'])
    .then(() => {
      if ( this.isBtnPagoShow ) {
        window.location.reload();
      }
    });

    this.listenStatusService.setIsPagePagarCuentaShow(true);
  }

  // el cleinte solicita atencion del personal. -- notifica en caja
  solicitarAtencion() {
    if ( this.isViewMsjSolicitudPersoanl ) { return; }
    console.log('notificar-cliente-llamado');
    this.socketService.emit('notificar-cliente-llamado', this.infoToken.numMesaLector);
    this.isViewMsjSolicitudPersoanl = true;
    setTimeout(() => {
      this.isViewMsjSolicitudPersoanl = false;
    }, 30000);
  }

  showDatosFacturacion() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass =  ['my-dialog-orden-detalle', 'margen-0'];

    this.dialogDatosFacturacion.open(DatosFacturacionClienteComponent, dialogConfig);
  }

}
