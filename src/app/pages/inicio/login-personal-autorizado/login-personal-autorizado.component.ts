import { Component, OnInit } from '@angular/core';
import { UsuarioAutorizadoModel } from 'src/app/modelos/usuario-autorizado.model';
import { Router } from '@angular/router';
import { AuthServiceSotrage } from 'src/app/shared/services/auth.service';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { EstablecimientoService } from 'src/app/shared/services/establecimiento.service';
import { SocketService } from 'src/app/shared/services/socket.service';
import { HoldingService } from 'src/app/shared/services/holding.service';

@Component({
  selector: 'app-login-personal-autorizado',
  templateUrl: './login-personal-autorizado.component.html',
  styleUrls: ['./login-personal-autorizado.component.css']
})
export class LoginPersonalAutorizadoComponent implements OnInit {

  usuario: UsuarioAutorizadoModel;
  loading = false;
  msjErr = false;

  constructor(
    private socketService: SocketService,
    private router: Router,
    private authService: AuthServiceSotrage,
    private infoToken: InfoTockenService,
    private establecimientoService: EstablecimientoService,
    private holdingService: HoldingService
  ) { }

  ngOnInit() {

    // console.log('aaaaaaaaaaaaaaaaaaaaa');
    // salvar configpunto
    this.usuario = new UsuarioAutorizadoModel();

    const configPunto = localStorage.getItem('sys::punto');
    let _us: any = localStorage.getItem('::us');    
    // this.authService.loggedOutUser(false);
    localStorage.clear();

    if (_us) {       
      localStorage.setItem('::us', _us)
      _us = JSON.parse(_us);      
      if ( _us.recordar ) {
        this.usuario.nomusuario = _us.nomusuario;
        this.usuario.pass = _us.pass;
        this.usuario.recordar = _us.recordar
      }
    }

    if ( configPunto ) {
      localStorage.setItem('sys::punto', configPunto);
    }


    

    // cerramos socket para que cargue carta nuevamente
    if ( this.socketService.isSocketOpen ) {
      this.socketService.closeConnection();
    }
  }

  logear(): void {
    this.loading = true;
    this.msjErr = false;
    this.authService.setLocalToken('');
    this.authService.getUserLogged(this.usuario).subscribe(res => {
      setTimeout(() => {
        console.log('res logear', res);
        if (res.success) {
          this.authService.setLocalToken(res.token);
          this.authService.setLocalTokenAuth(res.token);
          this.authService.setLoggedStatus(true);
          this.authService.setLocalUsuario(this.usuario);
          this.infoToken.converToJSON();
          this.infoToken.setIsUsuarioAutorizacion(true);
          this.infoToken.converToJSON();
          this.loadDataEstablecimiento(res.usuario.idsede);

          if ( res.usuario.is_holding == '1' ) {
            this.loadHolding(res.usuario.idsede);
            this.router.navigate(['./pedido/holding']);            
          } else {
            this.router.navigate(['./pedido']);
          }

          // this.loading = false;
        } else {
          this.loading = false;
          this.msjErr = true;
        }
      }, 2000);
    });
  }


  private loadDataEstablecimiento(id: number) {
    this.establecimientoService.loadEstablecimientoById(id);
  }

  private loadHolding(idsede: number) {
    this.holdingService.setHolding(idsede);
  }

}
