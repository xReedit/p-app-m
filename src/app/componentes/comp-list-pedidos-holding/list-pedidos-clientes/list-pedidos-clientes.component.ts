import { Component, OnInit } from '@angular/core';
import { ClienteProfileGuard } from 'src/app/shared/guards/cliente-profile-guards';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { HoldingService } from 'src/app/shared/services/holding.service';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { MipedidoService } from 'src/app/shared/services/mipedido.service';
import { NavigatorLinkService } from 'src/app/shared/services/navigator-link.service';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-list-pedidos-clientes',
  templateUrl: './list-pedidos-clientes.component.html',
  styleUrls: ['./list-pedidos-clientes.component.css']
})
export class ListPedidosClientesComponent implements OnInit {

  listPedidosClientes = [];

  constructor(
    private httpClient: CrudHttpService,
    private socketService: SocketService,
    private navigatorLinkService: NavigatorLinkService,
    private infoTokenService: InfoTockenService,
    private miPedidoService: MipedidoService,
    private holdingService: HoldingService
  ) { }

  ngOnInit(): void {      
    this.navigatorLinkService.resNavigatorSourceObserve$
    .subscribe((res: any) => {
      if ( res.pageActive === 'pedidos' ) {
        this.loadPedidosClientes();

        // this.socketService.onGetNuevoPedido()
        // .subscribe((res: any) => {     
        //   this.addPedidoCliente(res);
        // });
      }      
    });
  }

  private loadPedidosClientes() {
    const dataSend = {
      idsede_holding: this.infoTokenService.getInfoUs().holding.idsede_holding
    }
    this.httpClient.postFree(dataSend, 'holding', 'get-pedido-cliente-by-holding', true)
    .subscribe((res: any) => {
      console.log('loadPedidosClientes', res);
      if ( res.data ) {
        res.data.forEach((item: any) => {          
          this.addPedidoCliente(item);
        });
      }
    });
  }

  private addPedidoCliente(item: any) {
    console.log('nuevo pedido cliente', item);	
    const itemPedido = this.listPedidosClientes.filter(x => x.idpedido_cliente_confirmar_holding === item.idpedido_cliente_confirmar_holding)[0];
    if (!itemPedido) {
      this.playAudio();
      const dataPedido = item.json_pedido.dataPedido;
      
      // Añadir el nuevo pedido al inicio de la lista (unshift en lugar de push)
      this.listPedidosClientes.unshift({
        idpedido_cliente_confirmar_holding: item.idpedido_cliente_confirmar_holding,
        fecha_hora_pedido: item.fecha_hora,
        dataPedido: dataPedido,
        nombre_cliente: dataPedido.p_header.nom_us,
        mesa: dataPedido.p_header.m
      });
      
      // Si hay más de 3 elementos, eliminar el último (el más antiguo ahora)
      if (this.listPedidosClientes.length > 3) {
        this.listPedidosClientes.pop();
      }
    }
  }

  private playAudio() {
    const audio = new Audio();
    audio.src = '../assets/sound/notifica-llamado.mp3';
    audio.load();

    try {
      audio.play();
      window.navigator.vibrate([100, 50, 100]);
    } catch (error) {}
  }

  verPedido(pedido: any) {
    pedido.confirmando_pago = true;
    console.log('verPedido', pedido);
    this.holdingService.setLocalStoragePedidoClienteHolding(pedido.idpedido_cliente_confirmar_holding);
    this.holdingService.setPedidoClienteHoldingMarcarAtendido(pedido.idpedido_cliente_confirmar_holding, this.infoTokenService.getInfoUs().idusuario);
    this.miPedidoService.setObjMiPedido(pedido.dataPedido.p_body);
    this.navigatorLinkService.setPageActive('mipedido');
  }

  
}
