import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { VerifyAuthClientService } from 'src/app/shared/services/verify-auth-client.service';
import { take } from 'rxjs/internal/operators/take';
import { SocketClientModel } from 'src/app/modelos/socket.client.model';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit, OnDestroy {

  private veryfyClient: Subscription = null;

  isLogin = false;
  nombreClientSocket = '';

  constructor(
    private verifyClientService: VerifyAuthClientService,
    // private webSocketService: WebsocketService
    ) { }

  ngOnInit() {
    this.nombreClientSocket = '';
    screen.orientation.unlock();

    this.verifyClientService.getDataClient();
    this.verifyClientService.setQrSuccess(false);

    this.isLogin = this.verifyClientService.isLogin();
    // console.log('desde incio', this.isLogin);

    this.veryfyClient = this.verifyClientService.verifyClient()
      .subscribe((res: SocketClientModel) => {
        this.nombreClientSocket = res.usuario;
        this.isLogin = this.verifyClientService.getIsLoginByDNI() ? true : this.verifyClientService.isLogin();
        this.verifyClientService.setQrSuccess(false);
        // console.log('res idcliente', res);
      });
  }

  ngOnDestroy(): void {
    // this.verifyClientService.unsubscribeClient();
    this.veryfyClient.unsubscribe();
  }

  // changeLenguage() {
  //   const elements = this.elem.nativeElement.querySelectorAll('.goog-te-combo');
  //   elements.value = 'es';
  // }

  cerrarSession(): void {
    this.verifyClientService.loginOut();
  }

}
