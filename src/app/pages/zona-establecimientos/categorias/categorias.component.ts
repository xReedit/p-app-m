import { Component, OnInit, OnDestroy } from '@angular/core';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { DeliveryEstablecimiento } from 'src/app/modelos/delivery.establecimiento';
import { Router, ActivatedRoute } from '@angular/router';
// import { AuthService } from 'src/app/shared/services/auth.service';
// import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { VerifyAuthClientService } from 'src/app/shared/services/verify-auth-client.service';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';
import { DeliveryDireccionCliente } from 'src/app/modelos/delivery.direccion.cliente.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SocketClientModel } from 'src/app/modelos/socket.client.model';
import { DialogSelectDireccionComponent } from 'src/app/componentes/dialog-select-direccion/dialog-select-direccion.component';
import { CalcDistanciaService } from 'src/app/shared/services/calc-distancia.service';
import { EstablecimientoService } from 'src/app/shared/services/establecimiento.service';
import { SocketService } from 'src/app/shared/services/socket.service';
import { EstadoPedidoModel } from 'src/app/modelos/estado.pedido.model';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { TiempoEntregaModel } from 'src/app/modelos/tiempo.entrega.model';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/operators';
import { MipedidoService } from 'src/app/shared/services/mipedido.service';
import { DialogDireccionClienteDeliveryComponent } from 'src/app/componentes/dialog-direccion-cliente-delivery/dialog-direccion-cliente-delivery.component';
// import { NavigatorLinkService } from 'src/app/shared/services/navigator-link.service';

// import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit, OnDestroy {
  // rippleColor = 'rgb(255,238,88, 0.2)';
  loaderPage = false;
  listEstablecimientos: DeliveryEstablecimiento[]; // es se utiliza para filtrar
  listEstablecimientosMaster: DeliveryEstablecimiento[];
  listPromociones = [];

  codigo_postal_actual: string; // codigo postal de direccion seleccionada
  ciudad_actual: string; // ciudad de direccion seleccionada
  infoClient: SocketClientModel;
  isNullselectedDireccion = true;
  isSelectedDireccion = false;
  direccionCliente: DeliveryDireccionCliente;

  listSubCatFiltros: any = []; // sub categoria para filtrar

  private idcategoria_selected: any;
  private isMismaDireccionSelectd = false; // si es la misma direccion el calculo de distancia y costo de servicio lo trae de cache
  // private veryfyClient: Subscription = null;

  private isClienteLogueado = false;

  private unsubscribe$: Subject<any> = new Subject<any>();

  isShowTextBusquedaComercio = false;
  constructor(
    private crudService: CrudHttpService,
    private router: Router,
    // private authService: AuthService,
    // private infoToken: InfoTockenService,
    private verifyClientService: VerifyAuthClientService,
    private listenService: ListenStatusService,
    private dialogDireccion: MatDialog,
    private calcDistanceService: CalcDistanciaService,
    private establecimientoService: EstablecimientoService,
    private socketService: SocketService,
    private infoTokenService: InfoTockenService,
    private pedidoService: MipedidoService
    // private activatedRoute: ActivatedRoute,
    // private navigatorService: NavigatorLinkService,
  ) { }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    // window.history.forward();
    // history.pushState(null, null, location.href);
    // window.onpopstate = function () {
    //     history.go(1);
    // };
    // history.pushState(null, null, document.title);

    // escucha si se cierra comercio from monitor
    // this.socketService.onComercioOpenChangeFromMonitor()
    //   .subscribe((res: any) => {
    //     console.log('onComercioOpenChangeFromMonitor id ', res);
    //     const _esChange = this.listEstablecimientos.filter(e => e.idsede === res.idsede)[0];
    //     if ( _esChange ) {
    //       _esChange.cerrado = res.estado;
    //     }

    //     // this.listEstablecimientos = JSON.parse(JSON.stringify(this.listEstablecimientos));
    //   });


    // reseteamos
    // this.infoTokenService.getInfoUs();
    if ( this.infoTokenService?.infoUsToken?.tiempoEntrega ) {
      this.infoTokenService.infoUsToken.tiempoEntrega = null;
      this.infoTokenService.set();
    }


    this.idcategoria_selected = localStorage.getItem('sys::cat');
    if ( this.idcategoria_selected !== '-1' ) {
      this.listSubCatFiltros = JSON.parse(atob(localStorage.getItem('sys:subcat'))); // filtro para celulares

      // preparr filtro
      this.listSubCatFiltros.map(x => x.selected = false);
      this.listSubCatFiltros.unshift({ id: 0, descripcion: 'Todos', selected: true });
      this.listSubCatFiltros.unshift({ id: 0, descripcion: 'buscar', selected: false });
    } else {
      this.listSubCatFiltros = [];
    }


    // this.activatedRoute.queryParams.subscribe(params => {
    //   if ( params['id'] ) {
    //     this.idcategoria_selected = params['id'];
    //     localStorage.setItem('sys::cat', this.idcategoria_selected.toString());
        // console.log('this.idcategoria_selected', this.idcategoria_selected);
    //   }
    // });

    // this.loadEstablecimientos();
    this.infoClient = this.verifyClientService.getDataClient();
    this.isClienteLogueado = this.infoClient.isCliente || false;

    this.listenService.isChangeDireccionDelivery$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((res: DeliveryDireccionCliente) => {
      if ( res ) {        
        this.codigo_postal_actual = res.codigo || '0';
        this.ciudad_actual = res.ciudad;
        this.isNullselectedDireccion = false;
        this.direccionCliente = res;

        // para el calculo distancia
        this.isMismaDireccionSelectd = this.infoClient.direccionEnvioSelected ? this.infoClient.direccionEnvioSelected.idcliente_pwa_direccion === this.direccionCliente.idcliente_pwa_direccion : false;

        this.infoClient.direccionEnvioSelected = this.direccionCliente;
        this.loadEstablecimientos();
        this.loadEstablecimientosPromos();
      } else {
        // console.log('dir null');
      }
    });

     // si no hay direccion abre el dialog
     setTimeout(() => {
      if ( this.isNullselectedDireccion ) {
        this.openDialogDireccion();
      }
    }, 800);
  }

  searchByNomComercio(nomComercio: string) {
    this.listEstablecimientos = this.listEstablecimientosMaster.filter(x => x.nombre.toLocaleLowerCase().includes(nomComercio.toLocaleLowerCase()));    
  }

  clearTextBusquedaComercio() {
    this.listEstablecimientos = this.listEstablecimientosMaster;
    this.isShowTextBusquedaComercio = false;
  }

  showTextBusquedaComercio() {
    this.listEstablecimientos = this.listEstablecimientosMaster;
    this.isShowTextBusquedaComercio = true;
  }

  loadEstablecimientos() {
    this.loaderPage = true;
    const _data = {
      idsede_categoria: this.idcategoria_selected,
      codigo_postal: this.ciudad_actual, // this.codigo_postal_actual, cambiamos el 310720
      point_client: this.direccionCliente.latitude + ' ' + this.direccionCliente.longitude
    };

    this.listEstablecimientos = [];
    this.listEstablecimientosMaster = [];

    this.crudService.postFree(_data, 'delivery', 'get-establecimientos', false)
      .subscribe( (res: any) => {
        // setTimeout(() => {
          this.listEstablecimientos = res.data;
          // console.log('this.listEstablecimientos', this.listEstablecimientos);
          this.listEstablecimientos.map((dirEstablecimiento: DeliveryEstablecimiento) => {
            dirEstablecimiento.visible = true;
            // this.calcDistancia(x);
            // this.calcDistanceService.calculateRoute(this.direccionCliente, dirEstablecimiento);
            // dirEstablecimiento.c_servicio = _c_servicio;

          });

        this.listEstablecimientosMaster = this.listEstablecimientos;

          // 250522 calculara la distancia cuando ingresa al comercio
          // this.setCalcDistanciaComercio();

        setTimeout(() => {
          this.loaderPage = false;
        }, 500);
      });
  }

  // 250522 calculara la distancia cuando ingresa al comercio
  private async setCalcDistanciaComercio() {
    // const listEsblecimientosCache = this.isMismaDireccionSelectd ? this.establecimientoService.getEstableciminetosCache() : [];
    let listEsblecimientosCache = <any>this.establecimientoService.getEstableciminetosCache();


    // buscamos si la direccion del cliente ya fue cacheada
    listEsblecimientosCache = listEsblecimientosCache.filter(e => e.idcliente_pwa_direccion ===  this.direccionCliente.idcliente_pwa_direccion)[0];
    listEsblecimientosCache = listEsblecimientosCache ? listEsblecimientosCache.listEstablecimientos : [];

    const lentEstCache = listEsblecimientosCache.length;
    const lentArray = this.listEstablecimientos.length;
    let _dirEstablecimiento: any;
    let _establecimientoEnCache: any;
    let yaCalculado = false;

    // let _sleep = 0;
    // console.log('calc distancia');
    for (let index = 0; index < lentArray; index++) {
        yaCalculado  = false;
        _dirEstablecimiento = <DeliveryEstablecimiento>this.listEstablecimientos[index];
        _establecimientoEnCache = listEsblecimientosCache.filter(e => e.idsede === _dirEstablecimiento.idsede)[0];



        // si la direccion es la misma
        // if ( this.isMismaDireccionSelectd ) {
        //   // buscamos en cache
        //   if ( lentEstCache > 0 ) {
        //     const _estCache = <DeliveryEstablecimiento>listEsblecimientosCache.filter(e => e.idsede === _dirEstablecimiento.idsede)[0];
        //     if ( _estCache ) {
        //       _dirEstablecimiento.c_servicio = _estCache.c_servicio;
        //       _dirEstablecimiento.distancia_km = _estCache.distancia_km;
        //       yaCalculado  = true;
        //     }
        //   }

        // }

        if ( _establecimientoEnCache ) {
          // console.log('establecimiento cacheado', _establecimientoEnCache);
          _dirEstablecimiento.distancia_km = _establecimientoEnCache.distancia_km;
          _dirEstablecimiento.c_servicio = this.calcDistanceService.calCostoDistancia(_dirEstablecimiento, _establecimientoEnCache.distancia_km);
          // si el costo del delivery es mayor a 15 lo vuelve a calcular
          yaCalculado  = _dirEstablecimiento.c_servicio <= 15;
        }

        if ( _dirEstablecimiento.cerrado === 0 && !yaCalculado) {
          // console.log('calc distance', _dirEstablecimiento);
          // _sleep = 600;
          // this.calcDistanceService.calculateRoute(this.direccionCliente, _dirEstablecimiento, false);
          this.calcDistanceService.calculateRouteNoApi(this.direccionCliente, _dirEstablecimiento, false);
          _dirEstablecimiento.calcApiGoogle = false;
          listEsblecimientosCache.push(_dirEstablecimiento);
          // await this.sleep(600);
        }
    }

    // guardar lista en cache
    const establecimientoToCache = {
      idcliente_pwa_direccion: this.direccionCliente.idcliente_pwa_direccion,
      listEstablecimientos: listEsblecimientosCache
    };

    this.establecimientoService.setEstableciminetosCache(establecimientoToCache);
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  // private calcDistancia(direccionEstablecimiento: DeliveryEstablecimiento) {
  //   this.calcDistanceService.calculateRoute(this.direccionCliente, direccionEstablecimiento);
  // }

  itemSelected($event: DeliveryEstablecimiento) {
    // console.log('establecimiento seleccionada', $event);

    // busca en el cache si ya calculo la distancia con la api de google
    // const _establecimientoCache = this.establecimientoService.getFindDirClienteCacheEstableciemto(this.direccionCliente, $event);
    // if ( _establecimientoCache.calcApiGoogle ) {
    //    this.calcDistanceService.calculateRoute(this.direccionCliente, $event, false);
    // }

    

    this.socketService.closeConnection();

    this.verifyClientService.setIdSede($event.idsede);
    this.verifyClientService.setIdOrg($event.idorg);
    this.verifyClientService.setIsDelivery(true);
    this.verifyClientService.setDataClient();
    
    this.infoTokenService.set();

    // console.log('establecimiento selected', $event);
    this.establecimientoService.set($event);

    // restcarta
    this.pedidoService.resetAllNewPedido();

    // console.log('this.infoClient', this.infoClient);
    if (!this.isClienteLogueado) { this.registarDirCliente(); return; }

    this.router.navigate(['/callback-auth']);

  }

  registarDirCliente() {
    this.verifyClientService.setIsDelivery(true);
    this.router.navigate(['/login-client']);
  }

  openDialogDireccion1() {
    // const dialogConfig = new MatDialogConfig();
    
    const dialogRef = this.dialogDireccion.open(DialogSelectDireccionComponent, {
      // panelClass: 'my-full-screen-dialog',
      panelClass: ['my-dialog-orden-detalle', 'my-dialog-scrool'],
    });

    dialogRef.afterClosed().subscribe(
      data => {
        if ( !data ) { return; }
        // console.log('data dialog', data);
        this.direccionCliente = data;
        this.verifyClientService.setDireccionDeliverySelected(this.direccionCliente);
        // this.setDireccion(data);
      }
    );
  }


  openDialogDireccion() {
    // if ( !this.isClienteLogueado ) {this.registarDirCliente(); return; }

    const _dialogConfig = new MatDialogConfig();
    _dialogConfig.disableClose = true;
    _dialogConfig.hasBackdrop = true;
    _dialogConfig.panelClass = ['my-dialog-orden-detalle', 'my-dialog-scrool'];

    _dialogConfig.data = {
      idcliente : this.infoClient.idcliente
    };

    const dialogDireccionCliente = this.dialogDireccion.open(DialogDireccionClienteDeliveryComponent, _dialogConfig);
    dialogDireccionCliente.afterClosed().subscribe((data: any) => {
      if ( !data ) { return; }
        // console.log('direcion', data);
        this.direccionCliente = data;
        this.verifyClientService.setDireccionDeliverySelected(this.direccionCliente);
        this.listenService.setChangeDireccionDelivery(this.direccionCliente);

        // this.verifyClientService.setDireccionDeliverySelected(data);
        // this.setDireccion(data);
    });

  }

  aplicarFitroSubCategoria(itemFiltro: any) {
    this.listSubCatFiltros.map(x => x.selected = false);
    itemFiltro.selected = true;

    if ( itemFiltro.id === 0 ) { // todos
      this.listEstablecimientos
      .map((e: DeliveryEstablecimiento) => {e.visible = true ; });
      return;
    }

    this.listEstablecimientos
      .map((e: DeliveryEstablecimiento) => {
        e.visible = false;
        e.idsede_subcategoria_filtro = '';
        e.idsede_subcategoria.split(',').map(i => {
          e.idsede_subcategoria_filtro += `.${i}.`;
        });
        return e;
      })
      .filter((e: DeliveryEstablecimiento) => e.idsede_subcategoria_filtro.indexOf('.' + itemFiltro.id + '.') > -1  )
      .map((e: DeliveryEstablecimiento) => e.visible = true);
  }


  loadEstablecimientosPromos() {
    const _data = {
      ciudad: this.ciudad_actual // this.codigo_postal_actual, cambiamos el 310720
    };

    this.listPromociones = [];

    this.crudService.postFree(_data, 'delivery', 'get-establecimientos-promos', false)
    .subscribe( (res: any) => {
      this.listPromociones = res.data.length > 0 ? res.data.filter(x => x.idpromocion && x.cerrado === 0) : [];
      });
  }

}
