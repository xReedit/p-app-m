import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { SocketService } from './socket.service';

import { ItemModel } from 'src/app/modelos/item.model';
import { PedidoModel } from 'src/app/modelos/pedido.model';
import { CategoriaModel } from 'src/app/modelos/categoria.model';
import { SeccionModel } from 'src/app/modelos/seccion.model';
import { MAX_MINUTE_ORDER } from '../config/config.const';
import { TipoConsumoModel } from 'src/app/modelos/tipoconsumo.model';
import { ItemTipoConsumoModel } from 'src/app/modelos/item.tipoconsumo.model';

@Injectable({
  providedIn: 'root'
})
export class MipedidoService {

  public objCarta: any;
  listItemsPedido: ItemModel[] = [];
  miPedido: PedidoModel = new PedidoModel();

  objItemTipoConsumoSelected: ItemTipoConsumoModel[];
  objSeccionSelected: SeccionModel = new SeccionModel();

  time = new Date();
  max_minute_order = MAX_MINUTE_ORDER;

  constructor(
    private storageService: StorageService,
    private socketService: SocketService) {
      // console.log('aaaaaaaaaaaaa');
    }

  getObjCarta() {
    return this.objCarta;
  }

  setObjCarta(_objCarta: any) {
    this.objCarta = _objCarta;
  }

  getMiPedido(): PedidoModel {
    return this.miPedido;
  }

  // setea los tipos de consumo del item seleccionado para sumar las cantidaddes seleccionadas
  setobjItemTipoConsumoSelected(_objItemTipoConsumoSelected: ItemTipoConsumoModel[]) {
    this.objItemTipoConsumoSelected = _objItemTipoConsumoSelected;
  }

  // seteamos seccion seleccionada menos items[]; para que no se forme el bucle
  setObjSeccionSeleced(seccion: SeccionModel) {
    this.objSeccionSelected.des = seccion.des;
    this.objSeccionSelected.idimpresora = seccion.idimpresora;
    this.objSeccionSelected.idseccion = seccion.idseccion;
    this.objSeccionSelected.sec_orden = seccion.sec_orden;
    this.objSeccionSelected.ver_stock_cero = seccion.ver_stock_cero;
  }

  // suma cantidad seleccionada
  addItem2(tipoconsumo: ItemTipoConsumoModel, item: ItemModel, signo: number = 0) {
    let sumTotalTpcSelected = this.totalItemTpcSelected();
    let cantItem = parseInt(item.cantidad.toString(), 0);
    const sumar = signo === 0 ? true : false;

    if (cantItem <= 0 && sumar) { return; }

    let cantSeleccionada = tipoconsumo.cantidad_seleccionada || 0;
    cantSeleccionada += sumar ? 1 : -1;
    if (cantSeleccionada < 0) { return; }

    cantItem += sumar ? -1 : 1;
    cantSeleccionada = cantSeleccionada < 0 ? 0 : cantSeleccionada;
    cantItem = cantItem < 0 || cantSeleccionada < 0 ? 0 : cantItem;
    tipoconsumo.cantidad_seleccionada = cantSeleccionada;

    sumTotalTpcSelected = this.totalItemTpcSelected() || 0;
    item.cantidad_seleccionada = sumTotalTpcSelected;
    item.cantidad = cantItem;

    // this.estadoItemColor = this.getEstadoStockItem(cantItem);


    // json pedido
    const _tipoconsumo = JSON.parse(JSON.stringify(tipoconsumo));
    const itemInPedido = this.findItemMiPedido(_tipoconsumo, this.objSeccionSelected, item);
    itemInPedido.cantidad_seleccionada = sumTotalTpcSelected;
    itemInPedido.cantidad = cantItem;

    // para el local storage recuperar y resetear
    const itemInList = this.findItemFromArr(this.listItemsPedido, item); // <ItemModel>this.listItemsPedido.filter( x => x.iditem === item.iditem )[0];
    if (itemInList) {
      itemInList.cantidad_seleccionada = sumTotalTpcSelected;
      itemInList.cantidad = cantItem;
    } else {
      this.listItemsPedido.push(item);
    }

    // hora que comienza a realizar el pedido
    this.setLocalStorageHora();

    // guardamos el pedido en local // por si se actualiza
    this.setLocalStoragePedido();

    // emitir item modificado
    this.socketService.emit('itemModificado', item);

    // console.log('listItemsPedido', this.listItemsPedido);
    // console.log('this.miPedido', this.miPedido);
  }

  totalItemTpcSelected(): number {
    return this.objItemTipoConsumoSelected.map((x: ItemTipoConsumoModel) => x.cantidad_seleccionada || 0).reduce((a, b) => a + b, 0);
  }

  // buscar item en listItemsPedido
  findItemFromArr(arrFind: any, item: ItemModel) {
    return arrFind.filter((x: any) => x.iditem === item.iditem)[0];
  }

  // buscar item en la carta
  findItemCarta(item: ItemModel): ItemModel {
    let rpt: ItemModel;
    this.objCarta.carta.map((cat: CategoriaModel) => {
      cat.secciones.map((sec: SeccionModel) => {
        const _rpt = sec.items.filter((x: ItemModel) => x.idcarta_lista === item.idcarta_lista)[0];
        if (_rpt) {
          rpt = _rpt;
          return rpt;
        }
      });
    });

    return rpt;
  }

  findItemMiPedido(tpc: any, seccion: any, item: ItemModel): ItemModel {
    let rpt: ItemModel;
    const findTpc = <TipoConsumoModel>this.miPedido.tipoconsumo.filter((x: TipoConsumoModel) => x.idtipo_consumo === tpc.idtipo_consumo)[0];
    if (findTpc) {
      const findSecc = <SeccionModel>findTpc.secciones.filter((sec: SeccionModel) => sec.idseccion === seccion.idseccion)[0];
      if (findSecc) {
        const _rpt = findSecc.items.filter((x: ItemModel) => x.idcarta_lista === item.idcarta_lista)[0];
        if (_rpt) {
          rpt = _rpt;
        } else {
          // si no existe item lo agrega
          findSecc.items.push(item);
          rpt = item;
        }
      } else {
        // si no existe seccion add
        seccion.items.push(item);
        findTpc.secciones.push(seccion);
      }
    } else {
      // si no existe tpc add
      const _newSeccion = JSON.parse(JSON.stringify(seccion));
      _newSeccion.items = [];
      _newSeccion.items.push(item);
      tpc.secciones = tpc.secciones ? tpc.secciones : [];
      tpc.secciones.push(_newSeccion);
      this.miPedido.tipoconsumo.push(tpc);
      rpt = item;
    }

    return rpt;
  }

  setLocalStorageHora() {
    if (this.storageService.isExistKey('sys::h')) { return; }
    const hora = `${this.time.getHours()}:${this.time.getMinutes()}:${this.time.getSeconds()}`;
    this.storageService.set('sys::h', hora.toString());
  }

  setLocalStoragePedido() {
    this.storageService.set('sys::order', JSON.stringify(this.listItemsPedido));
  }

  clearPedidoIsLimitTime() {
    if (!this.storageService.isExistKey('sys::order')) { return; }
    // if ( !this.storageService.isExistKey('sys::h') ) { return; }
    this.listItemsPedido = JSON.parse(this.storageService.get('sys::order'));

    if (this.isTimeLimit()) {
      // si el tiempo limite fue superado mandamos a restablecer carta
      this.socketService.emit('resetPedido', this.listItemsPedido);
      this.updatePedidoFromClear();
    }
  }

  updatePedidoFromStrorage() {
    if (!this.storageService.isExistKey('sys::order')) { return; }
    // if ( !this.storageService.isExistKey('sys::h') ) { return; }
    this.listItemsPedido = JSON.parse(this.storageService.get('sys::order'));

    // actualizar // buscar cada item en el obj carta
    this.listItemsPedido.map((item: ItemModel) => {
      if (item.isalmacen === 0) {
        this.objCarta.carta.map((cat: CategoriaModel) => {
          cat.secciones.map((sec: SeccionModel) => {
            const itemUpdate = sec.items.filter((x: ItemModel) => x.idcarta_lista === item.idcarta_lista)[0]
            if (itemUpdate) {
              // itemUpdate.cantidad = item.cantidad;
              itemUpdate.cantidad_seleccionada = item.cantidad_seleccionada;
              itemUpdate.itemtiposconsumo = item.itemtiposconsumo;
            }
          });
        });
      }
    });
  }

  // actualiza la carta del pedido reseteado por tiempo limite
  // solo local porque a los demas se le emite el socket
  updatePedidoFromClear() {
    // actualizar // buscar cada item en el obj carta
    this.listItemsPedido.map((item: ItemModel) => {
      if (item.isalmacen === 0) {
        this.objCarta.carta.map((cat: CategoriaModel) => {
          cat.secciones.map((sec: SeccionModel) => {
            const itemUpdate = <ItemModel>sec.items.filter((x: ItemModel) => x.idcarta_lista === item.idcarta_lista)[0];
            if (itemUpdate) {
              itemUpdate.cantidad = parseInt(itemUpdate.cantidad.toString(), 0) + item.cantidad_seleccionada;
            }
          });
        });
      }
    });

    // valor en blanco para nuevo pedido
    this.storageService.clear('sys::h');
    this.storageService.clear('sys::order');
    this.listItemsPedido = [];
  }

  getEstadoStockItem(stock: number): string {
    return stock > 10 ? 'verde' : stock > 5 ? 'amarillo' : 'rojo';
  }

  isTimeLimit(): boolean {
    const h2 = this.storageService.get('sys::h');
    const hora1 = this.time.getTime().toString().split(':');
    const hora2 = h2.split(':');
    const t1 = new Date();
    const t2 = new Date();

    // tslint:disable-next-line: radix
    t1.setHours(parseInt(hora2[0], 0), parseInt(hora2[1], 0), parseInt(hora2[2], 0));
    t2.setHours(this.time.getHours(), this.time.getMinutes(), this.time.getSeconds());
    const dif = t2.getTime() - t1.getTime(); // diferencia en milisegundos
    const difSeg = Math.floor(dif / 1000);
    const difMin = Math.floor(difSeg / 60);
    let minutos = difMin % 60; // minutos
    minutos = minutos < 0 ? minutos * -1 : minutos;
    return minutos > this.max_minute_order ? true : false;

  }

}
