import { Component, OnInit } from '@angular/core';
import { delay } from 'rxjs/operators';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { NotificacionPushService } from 'src/app/shared/services/notificacion-push.service';
import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-comp-list-call-client',
  templateUrl: './comp-list-call-client.component.html',
  styleUrls: ['./comp-list-call-client.component.css']
})
export class CompListCallClientComponent implements OnInit {

  isCliente = false;
  listCallsClients = [];
  listCallsMarcas = [];
  private isListenSocket = false;

  isHolding = false;

  constructor(
    private infoToken: InfoTockenService,
    private socketService: SocketService,
    private notificacionPush: NotificacionPushService,
  ) { }

  ngOnInit(): void {
    this.isCliente = this.infoToken.infoUsToken.isCliente || false;

    // push "pedido/plato listo" desde la zona de despacho, con la app abierta: misma tarjeta que el holding.
    // Un plato y el pedido completo del mismo pedido son tarjetas distintas (clave idpedido-detalle).
    this.notificacionPush.pedidoListo$.subscribe(n => {
      const esPlato = n.idpedido_detalle !== '0';
      this.addItemCallListLLamadaMarca({
        idpedido: esPlato ? `${n.idpedido}-${n.idpedido_detalle}` : n.idpedido,
        nom_marca: esPlato ? n.plato : 'Pedido completo',
        referencia: n.ref,
        fromPush: true,
      });
    });

    
    this.socketService.isSocketOpen$
      .subscribe(isOpen => {
        if ( !isOpen ) { return; }
        if ( this.isListenSocket) { return; }
        this.isListenSocket = true;
        this.listenSocket();
      });
  }

  private listenSocket() {
    if ( this.isCliente) { return; }

    // holding llama marca    
    this.socketService.onCallPedidoListoMarca()
    .subscribe((res: any) => {            
      res.en_camino = false;  
      this.isHolding = true;
      this.addItemCallListLLamadaMarca(res);
    });

    this.socketService.onNewPedidoClienteMesaHolding()
    .subscribe((res: any) => {
      alert('nuevo-pedido-cliente-holding');
    });

    // load llamados
    this.socketService.onLoadCallClienteLlama()
    .subscribe((resList: any) => {
      this.isHolding = false;
      resList.map((x: any) => this.addItemCallList(x.num_mesa));
    });

    // on llamado
    this.socketService.onGetClienteLlama()
    .subscribe((res: any) => {
      this.addItemCallList(res);
    });

    // remove llamado
    this.socketService.onRemoveClienteLlama()
    .subscribe((res: any) => {
      this.removeItemCallList(res);
    });
  }

  private addItemCallList(nummesa: string) {
    const itemCall = this.searchItemCallList(nummesa);
    if ( !itemCall ) {
      this.playAudio();
      this.listCallsClients.push(nummesa);
    }

  }

  private removeItemCallList(nummesa: string) {
    this.listCallsClients = this.listCallsClients.filter(x =>  x !== nummesa);
  }

  private searchItemCallList(nummesa: string) {
    return this.listCallsClients.filter(x =>  x === nummesa)[0];
  }

  goCallClient(nummesa: string) {
    this.socketService.emit('notificar-cliente-llamado-voy', nummesa);
    this.removeItemCallList(nummesa);
  }

  private playAudio() {
    const audio = new Audio();
    // audio.src = 'https://restobar.papaya.com.pe/sound/notifica-llamado.mp3';
    audio.src = 'assets/sound/notifica-llamado.mp3';
    audio.load();

    try {
      audio.play();

      // tslint:disable-next-line:max-line-length
      window.navigator.vibrate([100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50, 100, 50, 100, 100, 100, 50 , 50]);
    } catch (error) {}
  }

  private addItemCallListLLamadaMarca(item: any) {
    console.log('item', item);	
    const itemCall = this.listCallsMarcas.filter(x =>  x.idpedido === item.idpedido)[0];
    if ( !itemCall ) {
      this.playAudio();
      this.listCallsMarcas.push(item);
    }

  }

  private removeItemCallMarcaList(idpedido: string) {
    this.listCallsMarcas = this.listCallsMarcas.filter(x =>  x.idpedido !== idpedido);
  }

  goCallMarca(marca: any) {
    // marca.en_camino = true;
    // las tarjetas que vienen del push de cocina no tienen marca de holding a quien avisar
    if ( !marca.fromPush ) { this.socketService.emit('notificar-marca-mozo-en-camino', marca); }
    this.removeItemCallMarcaList(marca.idpedido);
  }

}
