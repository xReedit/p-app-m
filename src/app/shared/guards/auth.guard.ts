import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceSotrage } from '../services/auth.service';
import { VerifyAuthClientService } from '../services/verify-auth-client.service';
import { InfoTockenService } from '../services/info-token.service';
// import { InfoTockenService } from '../services/info-token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthServiceSotrage,
    private verifyClientService: VerifyAuthClientService,
    private infoTokenService: InfoTockenService,
  ) {}

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

  //   return true;
  // }

  canActivate() {
    const us = this.authService.getLoggedStatus();
    const infoToken = this.infoTokenService.getInfoUs();    
    const res = infoToken.isCliente ? infoToken.isDelivery || infoToken.isReserva  ? true : this.verifyClientService.getIsQrSuccess() && us : us;

    // if ( us )
    // console.log('AuthGuard res ====> ', res);
    return res;
  }

}
