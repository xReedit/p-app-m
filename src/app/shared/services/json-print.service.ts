// este servicio arma el json, que se envia para imprmir // print_setver_detalle

import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { MipedidoService } from './mipedido.service';
import { TipoConsumoModel } from 'src/app/modelos/tipoconsumo.model';
import { SeccionModel } from 'src/app/modelos/seccion.model';
import { ItemModel } from 'src/app/modelos/item.model';
import { PedidoModel } from 'src/app/modelos/pedido.model';
import { InfoTockenService } from './info-token.service';
import { CrudHttpService } from './crud-http.service';
import { timeout } from 'rxjs/operators';
import { impresoraPrecuentaPunto } from '../config/punto-toma-pedidos';

@Injectable({
  providedIn: 'root'
})


export class JsonPrintService {
  datosSede: any = [];

  private impresoras: any = [];
  private isUsuarioHolding: boolean = false;
  private readonly STORAGE_KEY = 'print_data_holding';
  private dataLocalPrinters: any = [];

  // impresión por área de mesas: { areas, impresoras } desde el node (pedido/reglas-impresora-area)
  private reglasArea: any = null;
  private reglasAreaSede = ''; // idsede de la caché: si cambia la sede (logout / otra sede) se descarta
  private reglasAreaAt = 0;
  private reglasAreaPromise: Promise<any> = null;
  private reglasAreaFalloAt = 0; // si el node no responde (o aún no tiene el endpoint) no se reintenta en cada click
  private readonly REGLAS_AREA_TTL_MS = 5 * 60 * 1000;


  constructor(    
    private pedidoService: MipedidoService,
    private infoTokenService: InfoTockenService,
    private crudService: CrudHttpService
    ) {
      this.isUsuarioHolding = this.infoTokenService.infoUsToken.is_holding == '1';
      this.obtenerReglasArea(); // precarga; si falla la precuenta sigue como antes
  }

  // reglas por área (cacheadas). Nunca rechaza: ante error devuelve lo último que tenga o null.
  obtenerReglasArea(): Promise<any> {
    const sede = this.sedeActual();
    if (!sede) { return Promise.resolve(null); }
    if (sede !== this.reglasAreaSede) {
      // otra sede sin recargar la app: se descarta todo lo de la sede anterior
      this.reglasArea = null;
      this.reglasAreaAt = 0;
      this.reglasAreaFalloAt = 0;
      this.reglasAreaPromise = null;
      this.reglasAreaSede = sede;
    }
    if (this.reglasArea && Date.now() - this.reglasAreaAt < this.REGLAS_AREA_TTL_MS) {
      return Promise.resolve(this.reglasArea);
    }
    if (this.reglasAreaPromise) { return this.reglasAreaPromise; }
    if (Date.now() - this.reglasAreaFalloAt < 60 * 1000) { return Promise.resolve(this.reglasArea); }

    const promesa: Promise<any> = this.crudService.postFree({}, 'pedido', 'reglas-impresora-area', true)
      .pipe(timeout(4000))
      .toPromise()
      .then((res: any) => {
        if (sede !== this.reglasAreaSede) { return null; } // la sede cambió mientras se cargaba
        const data = res && res.data ? res.data : null;
        const esDeLaSede = data && (data.idsede === undefined || String(data.idsede) === sede);
        if (esDeLaSede && Array.isArray(data.areas) && Array.isArray(data.impresoras)) {
          this.reglasArea = data;
          this.reglasAreaAt = Date.now();
        } else {
          this.reglasAreaFalloAt = Date.now();
        }
        return this.reglasArea;
      })
      .catch(() => {
        if (sede !== this.reglasAreaSede) { return null; }
        this.reglasAreaFalloAt = Date.now();
        return this.reglasArea;
      })
      .then((r: any) => {
        if (this.reglasAreaPromise === promesa) { this.reglasAreaPromise = null; }
        return r;
      });

    this.reglasAreaPromise = promesa;
    return promesa;
  }

  private sedeActual(): string {
    const info: any = this.infoTokenService.infoUsToken;
    const idsede = info && info.idsede ? String(info.idsede) : '';
    return idsede === '0' ? '' : idsede;
  }

  // misma regla que backend-pedidos (service/regla-impresora-area.service.js) y la web legacy
  private buscarAreaMesa(areas: any[], mesa: any): any {
    const m = String(mesa ?? '').trim();
    if (m === '' || /^0+$/.test(m) || !Array.isArray(areas)) { return null; }
    return areas.find((a: any) => {
      if (!a) { return false; }
      let resto = m;
      if (String(a.tipo_mesa ?? '').trim().toLowerCase() === 'alfanumerica') {
        const prefijo = String(a.prefijo_mesa ?? '').trim().toUpperCase();
        if (!m.toUpperCase().startsWith(prefijo)) { return false; }
        resto = m.substring(prefijo.length);
      }
      if (!/^\d+$/.test(resto)) { return false; }
      const n = parseInt(resto, 10);
      return n >= Number(a.num_mesa_ini) && n <= Number(a.num_mesa_fin);
    }) || null;
  }

  // devuelve la impresora destino (fila de impresora) si el área de la mesa tiene regla para idimpresora, si no null
  private impresoraPorArea(mesa: any, idimpresora: any, reglas: any): any {
    try {
      if (!reglas || !idimpresora) { return null; }
      const area = this.buscarAreaMesa(reglas.areas, mesa);
      if (!area) { return null; }
      let lista: any[] = [];
      try { lista = JSON.parse(area.reglas_impresora || '[]'); } catch (e) { lista = []; }
      if (!Array.isArray(lista)) { return null; }
      const regla = lista.find((r: any) => r && Number(r.o) === Number(idimpresora));
      if (!regla) { return null; }
      return (reglas.impresoras || []).find((i: any) => Number(i.idimpresora) === Number(regla.d)) || null;
    } catch (e) {
      return null;
    }
  }

  // private saveLocalPrintData(bodyPrint: any[]): void {
  //   if (!this.isUsuarioHolding) return; 
  //   localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bodyPrint));
  // }

  // private getLocalPrintData(): any {
  //   if (!this.isUsuarioHolding) return []; 
  //   this.dataLocalPrinters = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
  //   return this.dataLocalPrinters;
  // }

  // removeLocalPrintData(): void {
  //   if (!this.isUsuarioHolding) return; 
  //   localStorage.removeItem(this.STORAGE_KEY);
  // }

  // obtener los datos de la sede
  private getDataSede(): void {
    // this.socketService.onGetDatosSede().subscribe((res: any) => {
      // this.datosSede = res[0];
      this.datosSede = this.pedidoService.objDatosSede;
      // console.log('datos de la sede', this.datosSede);
    // });
  }

  // relacionar secciones con impresoras
  private relationRowToPrint(iscliente: boolean = false): void {

    // datos de la sede
    this.getDataSede();


    const _objMiPedido = this.pedidoService.getMiPedido();
    const _tpcPrinter = this.pedidoService.getObjNewItemTiposConsumo();
    const xRptPrint: any = [];// this.getLocalPrintData(); // respuesta para enviar al backend
    const listOnlyPrinters: any = []; // lista de solo impresoras
    let xImpresoraPrint: any = []; // array de impresoras
    let xArrayBodyPrint: any = []; // el array de secciones e items a imprimir
    let printerAsigando: any = null;

    this.impresoras = <any[]>this.datosSede.impresoras;
    // valores de la primera impresora // impresora donde se pone el logo
    const num_copias_all = this.datosSede.datossede[0].num_copias; // numero de copias para las demas impresoras -local
    const var_size_font_tall_comanda = this.datosSede.datossede[0].var_size_font_tall_comanda; // tamañao de letras
    const pie_pagina = this.datosSede.datossede[0].pie_pagina;
    const pie_pagina_comprobante = this.datosSede.datossede[0].pie_pagina_comprobante;
    const isPrintPedidoDeliveryCompleto = this.datosSede.datossede[0].isprint_all_delivery.toString() === '1';
    let isHayDatosPrintObj = true; // si hay datos en el obj xArrayBodyPrint para imprimir
    let isPedidoDelivery = false;
    // let indexP = 0;

    // si es cliente asigna impresora a seccion sin impresora // ej delivery por aplicacion
    if ( iscliente ) {
      this.setFirstPrinterSeccionCliente( _objMiPedido,  this.impresoras);
    }

    // 041052022
    // si el tipo de consumo tiene un impresora especifica
    // ej: todo delivery se imprime en una impresora x

    let isTpcPrinter = false;
    let listTPCPrinter = _tpcPrinter;
    listTPCPrinter = listTPCPrinter.filter(p => p.idimpresora !== 0);
    isTpcPrinter = listTPCPrinter.length > 0;
    console.log('isTpcPrinter', isTpcPrinter);

    if ( isTpcPrinter ) {
      listTPCPrinter.map(p => {
        const _tpcPrint = p.idtipo_consumo;
        const xIdPrint = p.idimpresora;
        xArrayBodyPrint = [];

        _objMiPedido.tipoconsumo
          .filter((tpc: TipoConsumoModel) => tpc.idtipo_consumo === _tpcPrint)
          .map((tpc: TipoConsumoModel, indexP: number) => {
            xArrayBodyPrint[indexP] = { 'des': tpc.descripcion, 'id': tpc.idtipo_consumo, 'titlo': tpc.titulo, 'conDatos': false};
            tpc.secciones
            // .filter((s: SeccionModel) => s.id === _tpcPrint)
            .map((s: SeccionModel) => {
              s.items.map((i: ItemModel) => {

                  isHayDatosPrintObj = true;
                  xArrayBodyPrint[indexP].conDatos = true; // si la seccion tiene items
                  xArrayBodyPrint[indexP][i.iditem] = i;
                  xArrayBodyPrint[indexP][i.iditem].des_seccion = s.des;
                  xArrayBodyPrint[indexP][i.iditem].sec_orden = s.sec_orden;
                  xArrayBodyPrint[indexP][i.iditem].cantidad = i.cantidad_seleccionada.toString().padStart(2, '0');
                  xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(i.precio_print.toString()).toFixed(2);
                  if ( !i.subitems_view ) {
                    xArrayBodyPrint[indexP][i.iditem].subitems_view = null;
                  }

                  i.flag_add_tpc = true;

              });
            });

          });

        if (xArrayBodyPrint.length === 0 || !isHayDatosPrintObj) { return; }

        // buscamos la impresora en xArrayImpresoras;
        printerAsigando = this.impresoras.filter(pp => pp.idimpresora === xIdPrint)[0];

        xImpresoraPrint = [];
        const childPrinter: any = {};
        childPrinter.ip_print = printerAsigando.ip;
        childPrinter.var_margen_iz = printerAsigando.var_margen_iz;
        childPrinter.var_size_font = printerAsigando.var_size_font;
        childPrinter.local = 0;
        childPrinter.num_copias = printerAsigando.num_copias; // num_copias_all;
        childPrinter.var_size_font_tall_comanda = var_size_font_tall_comanda;
        childPrinter.copia_local = 0; // no imprime // solo para impresora local
        childPrinter.img64 = '';
        childPrinter.papel_size = printerAsigando.papel_size;
        childPrinter.pie_pagina = pie_pagina;
        childPrinter.pie_pagina_comprobante = pie_pagina_comprobante;

        xImpresoraPrint.push(childPrinter);

        
        xRptPrint.push({
          arrBodyPrint: xArrayBodyPrint,
          arrPrinters: xImpresoraPrint
        });
        
        listOnlyPrinters.push(childPrinter);
      });
    }



    // si es punto auto pedido agregamos la impresora asignada
    const _puntoConfig = JSON.parse(localStorage.getItem('sys::punto')) || {};
    _puntoConfig.ispunto_autopedido = _puntoConfig ? _puntoConfig.ispunto_autopedido : false;

    this.impresoras.map((p: any) => {
      isHayDatosPrintObj = false;
      xArrayBodyPrint = [];


      _objMiPedido.tipoconsumo
        .map((tpc: TipoConsumoModel, indexP: number) => {
          xArrayBodyPrint[indexP] = { 'des': tpc.descripcion, 'id': tpc.idtipo_consumo, 'titulo': tpc.titulo, 'conDatos': false};
          isPedidoDelivery = tpc.descripcion.toLowerCase() === 'delivery';

          tpc.secciones
            .filter((s: SeccionModel) => s.idimpresora === p.idimpresora)
            .map((s: SeccionModel) => {
              printerAsigando = p;

              // imprime todo el pedido en todas las areas si es delivery
              if (isPedidoDelivery && isPrintPedidoDeliveryCompleto) {
                tpc.secciones.map((seccion: SeccionModel) => {
                  seccion.items.map((i: ItemModel) => {

                    if ( i.flag_add_tpc ) {return; }

                    isHayDatosPrintObj = true;
                    xArrayBodyPrint[indexP].conDatos = true; // si la seccion tiene items
                    xArrayBodyPrint[indexP][i.iditem] = i;
                    xArrayBodyPrint[indexP][i.iditem].des_seccion = seccion.des;
                    xArrayBodyPrint[indexP][i.iditem].sec_orden = seccion.sec_orden;
                    xArrayBodyPrint[indexP][i.iditem].cantidad = i.cantidad_seleccionada.toString().padStart(2, '0');
                    xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(i.precio_print.toString()).toFixed(2);
                    if ( !i.subitems_view ) {
                      xArrayBodyPrint[indexP][i.iditem].subitems_view = null;
                    }
                  });
                });
              }

              s.items.map((i: ItemModel) => {
                if ( i.flag_add_tpc ) {return; }
                if (i.imprimir_comanda === 0 && !iscliente) { return; } // no imprimir // productos bodega u otros
                  // xArrayBodyPrint[indexP][i.iditem] = [];
                  isHayDatosPrintObj = true;
                  xArrayBodyPrint[indexP].conDatos = true; // si la seccion tiene items
                  xArrayBodyPrint[indexP][i.iditem] = i;
                  xArrayBodyPrint[indexP][i.iditem].des_seccion = s.des;
                  xArrayBodyPrint[indexP][i.iditem].sec_orden = s.sec_orden;
                  xArrayBodyPrint[indexP][i.iditem].cantidad = i.cantidad_seleccionada.toString().padStart(2, '0');
                  xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(i.precio_print.toString()).toFixed(2);
                  if ( !i.subitems_view ) {
                    xArrayBodyPrint[indexP][i.iditem].subitems_view = null;
                  }
                });
              });

            // otra impresora en seccion
            tpc.secciones
            .filter((s: SeccionModel) => s.idimpresora_otro === p.idimpresora)
            .map((s: SeccionModel) => {
              printerAsigando = p;

              // imprime todo el pedido en todas las areas si es delivery
              if (isPedidoDelivery && isPrintPedidoDeliveryCompleto) {
                tpc.secciones.map((seccion: SeccionModel) => {
                  seccion.items.map((i: ItemModel) => {

                    if ( i.flag_add_tpc ) {return; }

                    isHayDatosPrintObj = true;
                    xArrayBodyPrint[indexP].conDatos = true; // si la seccion tiene items
                    xArrayBodyPrint[indexP][i.iditem] = i;
                    xArrayBodyPrint[indexP][i.iditem].des_seccion = seccion.des;
                    xArrayBodyPrint[indexP][i.iditem].sec_orden = seccion.sec_orden;
                    xArrayBodyPrint[indexP][i.iditem].cantidad = i.cantidad_seleccionada.toString().padStart(2, '0');
                    xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(i.precio_print.toString()).toFixed(2);
                    if ( !i.subitems_view ) {
                      xArrayBodyPrint[indexP][i.iditem].subitems_view = null;
                    }
                  });
                });
              }

              s.items.map((i: ItemModel) => {
                if ( i.flag_add_tpc ) {return; }
                if (i.imprimir_comanda === 0 && !iscliente) { return; } // no imprimir // productos bodega u otros
                  // xArrayBodyPrint[indexP][i.iditem] = [];
                  isHayDatosPrintObj = true;
                  xArrayBodyPrint[indexP].conDatos = true; // si la seccion tiene items
                  xArrayBodyPrint[indexP][i.iditem] = i;
                  xArrayBodyPrint[indexP][i.iditem].des_seccion = s.des;
                  xArrayBodyPrint[indexP][i.iditem].sec_orden = s.sec_orden;
                  xArrayBodyPrint[indexP][i.iditem].cantidad = i.cantidad_seleccionada.toString().padStart(2, '0');
                  xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(i.precio_print.toString()).toFixed(2);
                  if ( !i.subitems_view ) {
                    xArrayBodyPrint[indexP][i.iditem].subitems_view = null;
                  }
                });
              });
              // indexP++;


              // si es punto autopedido
              if ( _puntoConfig.ispunto_autopedido ) {
                _puntoConfig.impresora.ip_print = _puntoConfig.impresora.ip;

                if ( p.idimpresora !== _puntoConfig.impresora.idimpresora ) { return; }

                tpc.secciones
                // .filter((s: SeccionModel) => s.idimpresora === p.idimpresora)
                .map((s: SeccionModel) => {
                  printerAsigando = _puntoConfig.impresora;

                  s.items.map((i: ItemModel) => {
                    if (i.imprimir_comanda === 0 && !iscliente) { return; } // no imprimir // productos bodega u otros
                      // xArrayBodyPrint[indexP][i.iditem] = [];
                      isHayDatosPrintObj = true;
                      xArrayBodyPrint[indexP].conDatos = true; // si la seccion tiene items
                      xArrayBodyPrint[indexP][i.iditem] = i;
                      xArrayBodyPrint[indexP][i.iditem].des_seccion = s.des;
                      xArrayBodyPrint[indexP][i.iditem].sec_orden = s.sec_orden;
                      xArrayBodyPrint[indexP][i.iditem].cantidad = i.cantidad_seleccionada.toString().padStart(2, '0');
                      xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(i.precio_print.toString()).toFixed(2);
                      if ( !i.subitems_view ) {
                        xArrayBodyPrint[indexP][i.iditem].subitems_view = null;
                      }
                    });
                  });
              }

          });


      if (xArrayBodyPrint.length === 0 || !isHayDatosPrintObj) { return; }

      xImpresoraPrint = [];
      const childPrinter: any = {};
      childPrinter.ip_print = printerAsigando.ip;
      childPrinter.var_margen_iz = printerAsigando.var_margen_iz;
      childPrinter.var_size_font = printerAsigando.var_size_font;
      childPrinter.local = 0;
      childPrinter.num_copias = printerAsigando.num_copias; // num_copias_all;
      childPrinter.var_size_font_tall_comanda = var_size_font_tall_comanda;
      childPrinter.copia_local = 0; // no imprime // solo para impresora local
      childPrinter.img64 = '';
      childPrinter.papel_size = printerAsigando.papel_size;
      childPrinter.pie_pagina = pie_pagina;
      childPrinter.pie_pagina_comprobante = pie_pagina_comprobante;

      xImpresoraPrint.push(childPrinter);

      // console.log('xArrayBodyPrint', xArrayBodyPrint);
      // console.log('xImpresoraPrint', xImpresoraPrint);
      xRptPrint.push({
        idsede: this.datosSede.datossede[0].idsede,
        arrBodyPrint: xArrayBodyPrint,
        arrPrinters: xImpresoraPrint
      });

      listOnlyPrinters.push(childPrinter);
    });


    xRptPrint.listPrinters = listOnlyPrinters;

    // if ( this.isUsuarioHolding ) {
    //   this.saveLocalPrintData(xRptPrint);
    // }

    return xRptPrint;



  }

  // recuepra la primera impresora para imprimir cuando manda el cliente y si la seccion no tiene impresora
  private GetFirstPrinter(listPrinter: any): any {
    let firtsPrinter: any = null;
    const countPrinters = listPrinter.length;
    if ( countPrinters > 0 ) {
        firtsPrinter = listPrinter[0];
    }

    if ( countPrinters > 1 && firtsPrinter.descripcion.toLowerCase() === 'caja' ) {
      firtsPrinter = listPrinter[1];
    }

    return firtsPrinter;
  }

  // asigna impresora a las seccion que no tienen // para cuando el cliente realize el pedido imprima
  private setFirstPrinterSeccionCliente(_objMiPedido: PedidoModel, listPrinter: any) {
    let firtsIdPrinter: any = {};
    _objMiPedido.tipoconsumo
        .map((tpc: TipoConsumoModel) => {
          firtsIdPrinter = tpc.secciones.filter((s: SeccionModel) => s.idimpresora !== 0)[0];
          if ( firtsIdPrinter ) { return; }
        });

      // sino encontro ningun impresora asigna impresora de la lista de impresoras
      if ( !firtsIdPrinter ) {
        firtsIdPrinter = this.GetFirstPrinter(listPrinter);
      }

      if ( !firtsIdPrinter ) { return; }

    // asignamos a las secciones que no tienen impresora
    _objMiPedido.tipoconsumo
        .map((tpc: TipoConsumoModel, indexP: number) => {
          firtsIdPrinter = tpc.secciones.filter((s: SeccionModel) => s.idimpresora === 0)
          .map((s: SeccionModel) => { s.idimpresora = firtsIdPrinter.idimpresora; });
        });
  }

  // mesa y reglas: impresión por área de mesas (opcionales; sin ellas se comporta como antes)
  getPrinterPrecuenta(mesa: any = '', reglas: any = null) {
    let xRptPrint: any; // respuesta para enviar al backend
    let xImpresoraPrint: any = []; // array de impresoras
    let xArrayBodyPrint: any = []; // el array de secciones e items a imprimir

    // datos de la sede
    this.getDataSede();

    // console.log('print precuenta');

    xImpresoraPrint = [];
    const var_size_font_tall_comanda = this.datosSede.datossede[0].var_size_font_tall_comanda; // tamañao de letras
    const pie_pagina = this.datosSede.datossede[0].pie_pagina;
    const pie_pagina_comprobante = this.datosSede.datossede[0].pie_pagina_comprobante;

    // formato imprimir
    const _objMiPedido = this.pedidoService.getMiPedido();
    console.log('_objMiPedido', _objMiPedido);
    xArrayBodyPrint = [];
      _objMiPedido.tipoconsumo
        .map((tpc: TipoConsumoModel, indexP: number) => {
          xArrayBodyPrint[indexP] = { 'des': tpc.descripcion, 'id': tpc.idtipo_consumo, 'titlo': tpc.titulo, 'conDatos': false};
          tpc.secciones
            .map((s: SeccionModel) => {
              s.items.map((i: ItemModel) => {
                // if (i.imprimir_comanda === 0) { return; } // no imprimir // productos bodega u otros
                  // xArrayBodyPrint[indexP][i.iditem] = [];
                  xArrayBodyPrint[indexP].conDatos = true; // si la seccion tiene items
                  // xArrayBodyPrint[indexP][i.iditem] = xArrayBodyPrint[indexP][i.iditem] ? xArrayBodyPrint[indexP][i.iditem] : i;
                  // xArrayBodyPrint[indexP][i.iditem].des_seccion = s.des;
                  // xArrayBodyPrint[indexP][i.iditem].cantidad = xArrayBodyPrint[indexP][i.iditem].cantidad ? xArrayBodyPrint[indexP][i.iditem].cantidad : 0;
                  // xArrayBodyPrint[indexP][i.iditem].precio_print_app = xArrayBodyPrint[indexP][i.iditem].precio_print_app ? xArrayBodyPrint[indexP][i.iditem].precio_print_app : 0;
                  // xArrayBodyPrint[indexP][i.iditem].cantidad += parseFloat(i.cantidad_seleccionada.toString()); // .toString().padStart(2, '0');
                  // xArrayBodyPrint[indexP][i.iditem].precio_print_app += parseFloat(i.precio_print.toString());
                  // xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(xArrayBodyPrint[indexP][i.iditem].precio_print_app.toString()).toFixed(2);

                  xArrayBodyPrint[indexP][i.iditem] = i;
                  xArrayBodyPrint[indexP][i.iditem].des_seccion = s.des;
                  xArrayBodyPrint[indexP][i.iditem].sec_orden = s.sec_orden;
                  xArrayBodyPrint[indexP][i.iditem].cantidad = i.cantidad_seleccionada.toString().padStart(2, '0');
                  xArrayBodyPrint[indexP][i.iditem].precio_print_app = parseFloat(i.precio_print.toString()).toFixed(2);
                  xArrayBodyPrint[indexP][i.iditem].precio_print = parseFloat(i.precio_print.toString()).toFixed(2);

                  if ( !i.subitems_view ) {
                    xArrayBodyPrint[indexP][i.iditem].subitems_view = null;
                  }
                });
              });
              // indexP++;
          });

    this.impresoras = <any[]>this.datosSede.impresoras;
    // -1 impresora precuenta
    const pPrecuenta = this.impresoras.filter(x => x.idtipo_otro).filter(x => x.idtipo_otro.indexOf('-1') > -1)[0];
    // 1. punto de toma de pedidos con impresora propia: la pre-cuenta sale en el equipo que la pide
    // 2. si no, la regla del área de la mesa; 3. si no, la impresora de pre-cuenta de siempre
    const pPunto = impresoraPrecuentaPunto(localStorage.getItem('sys::punto'), this.impresoras);
    if ( !pPunto && !pPrecuenta ) {return false; }
    const p = pPunto || this.impresoraPorArea(mesa, pPrecuenta.idimpresora, reglas) || pPrecuenta;
    const childPrinter: any = {};
      childPrinter.ip_print = p.ip;
      childPrinter.var_margen_iz = p.var_margen_iz;
      childPrinter.var_size_font = p.var_size_font;
      childPrinter.local = 0;
      childPrinter.num_copias = 0;
      childPrinter.var_size_font_tall_comanda = var_size_font_tall_comanda;
      childPrinter.copia_local = 0; // no imprime // solo para impresora local
      childPrinter.img64 = '';
      childPrinter.papel_size = p.papel_size;
      childPrinter.pie_pagina = pie_pagina;
      childPrinter.pie_pagina_comprobante = pie_pagina_comprobante;
    xImpresoraPrint.push(childPrinter);

    // buscar impresora de precuenta

    xRptPrint = {
      arrBodyPrint: xArrayBodyPrint,
      arrPrinters: xImpresoraPrint
    };

    return xRptPrint;
  }

  enviarMiPedido(iscliente: boolean = false): any {
    return this.relationRowToPrint(iscliente);
  }

}
