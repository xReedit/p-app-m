import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { EstadoPedidoModel } from 'src/app/modelos/estado.pedido.model';

@Injectable({
  providedIn: 'root'
})
export class ListenStatusService {

  // para activar la busqueda
  private isBusquedaSource = new BehaviorSubject<boolean>(false);
  public isBusqueda$ = this.isBusquedaSource.asObservable();

  // string a buscar
  private charBuquedaSource = new BehaviorSubject<string>('');
  public charBuqueda$ = this.charBuquedaSource.asObservable();

  // hay items en la busqueda - se encontro cuenta
  private hayCuentaBusquedaSource = new BehaviorSubject<boolean>(false);
  public hayCuentaBusqueda$ = this.hayCuentaBusquedaSource.asObservable();

  // datos de la sede estan disponible
  private hayDatosSedeSource = new BehaviorSubject<boolean>(false);
  public hayDatosSede$ = this.hayDatosSedeSource.asObservable();

  // si es cliente usuario
  private isUsuarioClienteSource = new BehaviorSubject<boolean>(false);
  public isUsuarioCliente$ = this.isUsuarioClienteSource.asObservable();

  // estado del pedido enviado por el cliente
  private estadoPedidoSource = new BehaviorSubject<EstadoPedidoModel>(new EstadoPedidoModel());
  public estadoPedido$ = this.estadoPedidoSource.asObservable();

  // hay pedido en el storage, si es cliente usuario no cargar al cuenta.
  private hayPedidoFromStorageSource = new BehaviorSubject<boolean>(false);
  public hayPedidoFromStorage$ = this.hayPedidoFromStorageSource.asObservable();

  constructor() { }

  setIsBusqueda() {
    if ( !this.isBusquedaSource.value ) {
      setTimeout(() => {
        this.isBusquedaSource.next(true);
      }, 250);
    } else {
      this.isBusquedaSource.next(false);
    }
  }

  setCharBusqueda(charFind: string) {
    this.charBuquedaSource.next(charFind);
  }

  setHayCuentaBuesqueda(value: boolean): void {
    this.hayCuentaBusquedaSource.next(value);
  }

  setHayDatosSede(value: boolean): void {
    this.hayDatosSedeSource.next(value);
  }

  setIsUsuarioCliente(value: boolean): void {
    this.isUsuarioClienteSource.next(value);
  }

  setEstadoPedido(value: EstadoPedidoModel): void {
    this.estadoPedidoSource.next(value);
  }

  setHayPedidoLocalStorage(value: boolean): void {
    this.hayPedidoFromStorageSource.next(value);
  }

}
