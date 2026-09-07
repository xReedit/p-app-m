import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../core/material/material.module';
import { DebounceClickDirective } from '../shared/directivas/debounce-click.directive';
import { AgmCoreModule } from '@agm/core';
import { environment } from '../../environments/environment';

import { DirectionsMapDirectiveDirective } from '../shared/directivas/directions-map-directive.directive';
import { DialogMetodoPagoComponent } from './dialog-metodo-pago/dialog-metodo-pago.component';
import { DialogVerificarTelefonoComponent } from './dialog-verificar-telefono/dialog-verificar-telefono.component';
import { DialogTipoComprobanteComponent } from './dialog-tipo-comprobante/dialog-tipo-comprobante.component';
import { CompPedidoDetalleComponent } from './comp-pedido-detalle/comp-pedido-detalle.component';

import { StarRatingModule } from 'angular-star-rating';
import { CompCajaTextoComponent } from './comp-caja-texto/comp-caja-texto.component';
import { CompCheckComponent } from './comp-check/comp-check.component';
import { CompCtrlAddFastComponent } from './comp-ctrl-add-fast/comp-ctrl-add-fast.component';
import { CompPasarelaPagoComponent } from './comp-pasarela-pago/comp-pasarela-pago.component';
import { CompGetHoraComponent } from './comp-get-hora/comp-get-hora.component';

import { DialogCalificacionSedeComponent } from './dialog-calificacion-sede/dialog-calificacion-sede.component';
import { DialogNombreClienteComponent } from './dialog-nombre-cliente/dialog-nombre-cliente.component';
import { CompListItemPedidoClienteComponent } from './comp-list-item-pedido-cliente/comp-list-item-pedido-cliente.component';
import { TextNomClienteComponent } from './text-nom-cliente/text-nom-cliente.component';
import { DialogConfigPuntoComponent } from './dialog-config-punto/dialog-config-punto.component';
import { MozoVirtualOnSpeechComponent } from './mozo-virtual/mozo-virtual-on-speech/mozo-virtual-on-speech.component';
import { MozoShowTraduceTextComponent } from './mozo-virtual/mozo-show-traduce-text/mozo-show-traduce-text.component';
import { ItemPromocionComponent } from './item-promocion/item-promocion.component';
import { MozoDialogComponent } from './mozo-virtual/mozo-dialog/mozo-dialog.component';
import { CompViewPromoComponent } from './comp-view-promo/comp-view-promo.component';
import { CompListCallClientComponent } from './comp-list-call-client/comp-list-call-client.component';
import { DatosFacturacionClienteComponent } from './datos-facturacion-cliente/datos-facturacion-cliente.component';
import { CompListMesasComponent } from './comp-list-mesas/comp-list-mesas.component';
import { HoldingMarcasComponent } from './holding/marcas/marcas.component';
import { ListComponent } from './holding/marcas/list/list.component';
import { ItemComponent } from './holding/marcas/item/item.component';
import { FormaPagoComponent } from './holding/forma-pago/forma-pago.component';
import { CompListPedidosHoldingComponent } from './comp-list-pedidos-holding/comp-list-pedidos-holding.component';
import { MainTabPedidosHoldingComponent } from './comp-list-pedidos-holding/main/main.component';
import { ListPedidosListoMarcasComponent } from './comp-list-pedidos-holding/list-pedidos-listo-marcas/list-pedidos-listo-marcas.component';
import { ListPedidosClientesComponent } from './comp-list-pedidos-holding/list-pedidos-clientes/list-pedidos-clientes.component';

@NgModule({
  declarations: [
    DebounceClickDirective,
    DirectionsMapDirectiveDirective,
    DialogMetodoPagoComponent,
    DialogVerificarTelefonoComponent,
    DialogTipoComprobanteComponent,
    CompPedidoDetalleComponent,
    CompCajaTextoComponent,
    CompCheckComponent,
    CompCtrlAddFastComponent,
    CompPasarelaPagoComponent,
    CompGetHoraComponent,
    DialogCalificacionSedeComponent,
    DialogNombreClienteComponent,
    CompListItemPedidoClienteComponent,
    TextNomClienteComponent,
    DialogConfigPuntoComponent,
    MozoVirtualOnSpeechComponent,
    MozoShowTraduceTextComponent,
    ItemPromocionComponent,
    MozoDialogComponent,
    CompViewPromoComponent,
    CompListCallClientComponent,
    DatosFacturacionClienteComponent,
    CompListMesasComponent,
    HoldingMarcasComponent,
    ListComponent,
    ItemComponent,
    FormaPagoComponent,
    CompListPedidosHoldingComponent,
    MainTabPedidosHoldingComponent,
    ListPedidosListoMarcasComponent,
    ListPedidosClientesComponent,
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsApiKey,
      libraries: ['places']
    }),
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    StarRatingModule.forRoot(),
  ],
  exports: [
    DebounceClickDirective,
    DialogMetodoPagoComponent,
    DialogVerificarTelefonoComponent,
    DialogTipoComprobanteComponent,
    CompPedidoDetalleComponent,
    CompCajaTextoComponent,
    CompCtrlAddFastComponent,
    CompPasarelaPagoComponent,
    CompGetHoraComponent,
    DialogCalificacionSedeComponent,
    CompListItemPedidoClienteComponent,
    TextNomClienteComponent,
    DialogConfigPuntoComponent,
    MozoVirtualOnSpeechComponent,
    MozoShowTraduceTextComponent,
    ItemPromocionComponent,
    MozoDialogComponent,
    CompViewPromoComponent,
    CompListCallClientComponent,
    DatosFacturacionClienteComponent,
    CompListMesasComponent,
    HoldingMarcasComponent,
    FormaPagoComponent,
    CompListPedidosHoldingComponent,
    MainTabPedidosHoldingComponent,
    ListPedidosListoMarcasComponent,
    ListPedidosClientesComponent,
  ],
})
export class ComponentesModule { }
