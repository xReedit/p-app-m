import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MipedidoService } from 'src/app/shared/services/mipedido.service';
import { ItemModel } from 'src/app/modelos/item.model';
import { ItemTipoConsumoModel } from 'src/app/modelos/item.tipoconsumo.model';
import { SubItem } from 'src/app/modelos/subitems.model';
import { SubItemContent } from 'src/app/modelos/subitem.content.model';

@Component({
  selector: 'app-dialog-item-edit',
  templateUrl: './dialog-item-edit.component.html',
  styleUrls: ['./dialog-item-edit.component.css'],
})
export class DialogItemEditComponent implements OnInit {

  idTpcItemResumenSelect: number;
  item: ItemModel;
  objItemTipoConsumoSelected: ItemTipoConsumoModel[];
  _subitems_selected = []; // subitems chequeados
  isOptionRequeridosComplet = false; // si todos los cheks requeridos estan marcados
  precioProducto: number;
  _precioProductoIni: number; // precio incio

  constructor(
    public miPedidoService: MipedidoService,
    private dialogRef: MatDialogRef<DialogItemEditComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {

    // this.idTpcItemResumenSelect = data.idTpcItemResumenSelect;
    this.item = data.item;
    this.item.cantidad = this.getCantidadItemCarta(); // trae el stock del item carta
    this.objItemTipoConsumoSelected = <ItemTipoConsumoModel[]>data.objItemTipoConsumoSelected;

    this.miPedidoService.setObjSeccionSeleced(data.seccion);
    this.miPedidoService.setobjItemTipoConsumoSelected(this.objItemTipoConsumoSelected);

    this.miPedidoService.listenChangeCantItem();

  }

  ngOnInit() {

    // listen cambios en el stock
    this.miPedidoService.itemStockChangeObserve$.subscribe((res: ItemModel) => {
      if ( this.item.iditem === res.iditem ) {
        this.item.cantidad = res.cantidad;
      }
    });

    this.item.subitems_selected = null;
    this.item.subitems_view = null;

    this.cocinarListSubItemsView();

    this.compItemSumImporte();
    // this.item.subitems.map((sub: SubItem) => sub.selected = false);

  }

  getCantidadItemCarta(): number {
    return parseInt(this.miPedidoService.findItemCarta(this.item).cantidad.toString(), 0);
  }

  private cocinarListSubItemsView(): void {


    if ( this.item.subitems && this.item.subitems.length > 0) {
      this.item.subitems.map( (z: SubItemContent) => {
            z.isSoloUno = z.subitem_cant_select === 1 ? true : false;
            z.isObligatorio = z.subitem_required_select === 1 ? true : false;
            z.des_cant_select = z.isSoloUno ? 'Solo ' : 'Hasta ';
            z.subitem_cant_select = z.subitem_cant_select === 0 ? z.opciones.length : z.subitem_cant_select;
            // z.isRequeridComplet = !z.isObligatorio ? true : false;

            z.opciones.map((x: SubItem) => {
                x.iditem_subitem = x.iditem_subitem;
                x.precio_visible = x.precio === 0 ? false : true;
                x.precio = x.precio_visible ? x.precio : 0;
                x.cantidad_visible = isNaN(parseFloat(x.cantidad)) ? false : true;
                // x.disabled = x.cantidad <= 0 ? true : false;
                // x.classAgotado = x.cantidad <= 0 ? 'agotado' : '';
                x.selected = false;
            });
        });

        this.item.indicaciones = '';
    } else {
      this.isOptionRequeridosComplet = true;
    }
  }

  addSubItem(subitemContent: SubItemContent, subitem: SubItem): void {
    // chequeamos cuantos subitem estan checkes
    let listSubItemChecked = subitemContent.opciones.filter((x: SubItem) => x.selected);
    let countSelectReq = listSubItemChecked.length;
    // console.log('listSubItemChecked', listSubItemChecked);

    listSubItemChecked.map( (_subItem: SubItem, i: number) =>  {
      if (countSelectReq > subitemContent.subitem_cant_select && _subItem !== subitem) {
        _subItem.selected = false;
        countSelectReq--;
      }
    });

    // total de cheks chekeados
    listSubItemChecked = subitemContent.opciones.filter((x: SubItem) => x.selected);
    const countOptionsCheks = listSubItemChecked.length;
    // quita el obligatorio
    if ( subitemContent.subitem_required_select === 1 ) {
      subitemContent.isObligatorio = countOptionsCheks === subitemContent.subitem_cant_select ? false : true;
    }

    // agrega las opciones seleccionadas al subitems_selected del item;
    this._subitems_selected = [];
    this.item.subitems.map((sc: SubItemContent) => {
      sc.opciones.filter((s: SubItem) => s.selected)
                .map((s: SubItem) => {
                  this._subitems_selected.push(s);
                });
    });

    this.item.subitems_selected = this._subitems_selected;

    this.checkOptionObligario();
    this.compItemSumImporte(true);
    // console.log(this.item);
}

  // chequea si todas las opciones requeridas ya estan marcadas
  private checkOptionObligario(): void {
      let countOptionReq = 0;
      this.item.subitems.map(t => {
          countOptionReq = t.isObligatorio ? + 1 : countOptionReq;
      });

      this.isOptionRequeridosComplet = countOptionReq === 0 ?  true : false;
  }

  private compItemSumImporte(fromToCheck = false): void {
    if ( fromToCheck ) {
        let _importeChecks = 0;
        this.item.subitems.map(t => {
            t.opciones.filter(o => o.selected).map(o => {
                _importeChecks += parseFloat(o.precio.toString());
            });
        });

        this.precioProducto = this._precioProductoIni + _importeChecks;
    } else {
        // si viene del btn add +
        this.precioProducto = this.getImporteTotalItem();
        this._precioProductoIni = this.precioProducto;
    }
  }

  private getImporteTotalItem(): number {
    let rpt = 0;
    rpt = this.miPedidoService.getImporteTotalItemFromMiPedido(this.item);
    rpt = rpt === 0 ? parseFloat(this.item.precio) : rpt;
    return rpt;
  }

  addItemToDialogItem(tpcSelect: ItemTipoConsumoModel, suma: number): void {
    console.log('restar desde dialogitem');
    this.item.subitems_selected = this._subitems_selected;
    this.miPedidoService.addItem2(tpcSelect, this.item, suma);

    this.compItemSumImporte();
    this.item.indicaciones = '';

  }

  getEstadoStockItem(stock: any): string {
    if ( stock === 'ND' ) {
      return 'verde';
    } else {
      const _stock = parseInt(stock, 0);
      return _stock > 10 ? 'verde' : _stock > 5 ? 'amarillo' : 'rojo';
    }
  }

  cerrarDlg(): void {
    this.dialogRef.close();
  }

}