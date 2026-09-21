import { Component, OnInit } from '@angular/core';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { EstablecimientoService } from 'src/app/shared/services/establecimiento.service';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { findCanalConsumoLocal } from 'src/app/shared/config/config.const';

@Component({
  selector: 'app-dialog-config-punto',
  templateUrl: './dialog-config-punto.component.html',
  styleUrls: ['./dialog-config-punto.component.css']
})
export class DialogConfigPuntoComponent implements OnInit {

  listImpresoras: any;
  listCanalConsumo: any;
  selectedValueImpresora: any;
  selectedValueCanConsumo: any;
  isPuntoAutoPedidoCheck: boolean;
  isTomaPedidoRapido: boolean;
  private isConfigGuardada = false; // false = instalacion nueva, se aplica el default al cargar los canales

  constructor(
    private crudService: CrudHttpService,
    private establecimientoService: EstablecimientoService,
    private infoTokenService: InfoTockenService
  ) { }

  ngOnInit(): void {
    // cargar impresoras disponibles
    this.listImpresoras = this.establecimientoService.getImpresoras();

    this.loadCanalesConsumo();

    // cargar de localstorage; instalacion nueva = default segun los canales de la sede (mismo criterio que carta.component)
    const _puntoConfig = JSON.parse(localStorage.getItem('sys::punto')) || {};
    this.isConfigGuardada = _puntoConfig.istoma_pedido_rapido !== undefined;
    this.isPuntoAutoPedidoCheck = _puntoConfig.ispunto_autopedido || false;
    this.selectedValueImpresora = _puntoConfig.impresora;

    this.isTomaPedidoRapido = _puntoConfig.istoma_pedido_rapido || false;
    this.selectedValueCanConsumo = _puntoConfig.canal_consumo;

    this.infoTokenService.setIsPuntoAutoPedido(this.isPuntoAutoPedidoCheck);
    this.infoTokenService.setIsTomaPedidoRapido(this.isTomaPedidoRapido);
  }

  setConifg() {
    this.isPuntoAutoPedidoCheck = this.isTomaPedidoRapido ? false : this.isPuntoAutoPedidoCheck;
    const dataStorage = {
      istoma_pedido_rapido: this.isTomaPedidoRapido,
      canal_consumo: this.selectedValueCanConsumo,
      ispunto_autopedido: this.isPuntoAutoPedidoCheck,
      impresora: this.selectedValueImpresora
    };

    localStorage.setItem('sys::punto', JSON.stringify(dataStorage));

    // console.log('dataStorage', dataStorage);

    this.infoTokenService.setIsPuntoAutoPedido(this.isPuntoAutoPedidoCheck);
    this.infoTokenService.setIsTomaPedidoRapido(this.isTomaPedidoRapido);

    location.reload();
  }

  private loadCanalesConsumo() {
    const _data = {
      idsede: this.infoTokenService.getInfoUs().idsede
    };

    this.crudService.postFree(_data, 'pedido', 'get-canales-consumo', false)
    .subscribe(res => {
      // console.log('res', res);
      this.listCanalConsumo = res.data || [];
      // instalacion nueva: pedido rapido activo solo si la sede tiene canal "consumir en el local"
      if ( !this.isConfigGuardada ) {
        const _canalLocal = findCanalConsumoLocal(this.listCanalConsumo);
        this.isTomaPedidoRapido = !!_canalLocal;
        this.selectedValueCanConsumo = _canalLocal;
        this.infoTokenService.setIsTomaPedidoRapido(this.isTomaPedidoRapido);
      }
    });
  }

  compareById(f1: any, f2: any): boolean {
    return f1 && f2 && f1.idimpresora === f2.idimpresora;
  }

  compareByIdCanal(f1: any, f2: any): boolean {
    return f1 && f2 && f1.idtipo_consumo === f2.idtipo_consumo;
  }

}
