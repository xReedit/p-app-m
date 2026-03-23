import { Injectable } from '@angular/core';
import { HoldingModel } from 'src/app/modelos/holding.model';
import { CrudHttpService } from './crud-http.service';
import { InfoTockenService } from './info-token.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface CachedData<T> {
  data: T[];
  timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class HoldingService {    
    holding: HoldingModel;

    private eventHttp = 'holding';
    private readonly LS_PEDIDO_CLIENTE_HOLDING_ID = 'sys::pedido_cliente_holding';
    private readonly LS_PEDIDO_CLIENTE_HOLDING_MESA = 'sys::pedido_cliente_holding_mesa';
    private readonly LS_PEDIDO_CLIENTE_HOLDING_REFERENCIA = 'sys::pedido_cliente_holding_referencia';
    constructor(
        private crudService: CrudHttpService,
        private infoToken: InfoTockenService,
    ) { }

    setHolding(idsede: number) {
        const datasend = {
            idsede: idsede
        }
        this.crudService.postFree(datasend, this.eventHttp, 'get-holding-by-idsede')
        .subscribe((res: any) => {            
            if (res.success) {
                this.holding = res.data[0];
                this.infoToken.setHolding(this.holding);
                localStorage.setItem('sys::holding', btoa(JSON.stringify(this.holding)));
            }
        });
    }

    getMetodoPagoMozo(): Observable<any[]> {
        const CACHE_KEY = 'sys::cached_metodo_pago';
        const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Check cache
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const parsed: CachedData<any> = JSON.parse(cachedData);
            const now = new Date().getTime();
            
            if (now - parsed.timestamp < ONE_DAY) {
            return of(parsed.data);
            }
        }

        // Cache miss or expired, fetch from API
        return this.crudService
        .getAll(this.eventHttp, 'get-metodo-pago-mozo', false, false, false)
        .pipe(
            map((response: any) => {
                const data = response.data || [];
                // Save to cache
                const cacheData: CachedData<any> = {
                    data,
                    timestamp: new Date().getTime()
                };
                
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                return data;
            }),
            catchError(error => {
                console.error('Error getting métodos de pago:', error);
                return throwError(() => error);
            })
        );
    }


    setPedidoClienteHoldingMarcarAtendido(idpedido_cliente_confirmar_holding: number, idusuario: number) {   
      const dataSend = {
          idpedido_cliente_confirmar_holding: idpedido_cliente_confirmar_holding,
          idusuario: idusuario
      }

      console.log('setPedidoClienteHoldingMarcarAtendido', dataSend);
      this.crudService.postFree(dataSend, this.eventHttp, 'set-marcar-pedido-cliente-holding-atendido')
      .subscribe((res: any) => {
        console.log('setPedidoClienteHoldingMarcarAtendido', res);
      });
    }


    setLocalStoragePedidoClienteHolding(id: any) {
      localStorage.setItem(this.LS_PEDIDO_CLIENTE_HOLDING_ID, id);
    }

    setLocalStoragePedidoClienteHoldingMesa(mesa: any) {
      localStorage.setItem(this.LS_PEDIDO_CLIENTE_HOLDING_MESA, mesa ?? '');
    }

    getLocalStoragePedidoClienteHoldingMesa() {
      const mesa = localStorage.getItem(this.LS_PEDIDO_CLIENTE_HOLDING_MESA);
      return mesa ? mesa : null;
    }

    removeLocalStoragePedidoClienteHoldingMesa() {
      localStorage.removeItem(this.LS_PEDIDO_CLIENTE_HOLDING_MESA);
    }

    setLocalStoragePedidoClienteHoldingReferencia(referencia: any) {
      localStorage.setItem(this.LS_PEDIDO_CLIENTE_HOLDING_REFERENCIA, referencia ?? '');
    }

    getLocalStoragePedidoClienteHoldingReferencia() {
      const referencia = localStorage.getItem(this.LS_PEDIDO_CLIENTE_HOLDING_REFERENCIA);
      return referencia ? referencia : null;
    }

    removeLocalStoragePedidoClienteHoldingReferencia() {
      localStorage.removeItem(this.LS_PEDIDO_CLIENTE_HOLDING_REFERENCIA);
    }

    getLocalStoragePedidoClienteHolding() {
      const id = localStorage.getItem(this.LS_PEDIDO_CLIENTE_HOLDING_ID);
      return id ? id : null;
    }

    removeLocalStoragePedidoClienteHolding() {
      localStorage.removeItem(this.LS_PEDIDO_CLIENTE_HOLDING_ID);
    }

    setMarcarPedidoClientePagado() {
      const id = this.getLocalStoragePedidoClienteHolding();
      if ( !id ) return;

      const dataSend = {
        idpedido_cliente_confirmar_holding: parseInt(id)
      }

      this.removeLocalStoragePedidoClienteHolding();
      this.removeLocalStoragePedidoClienteHoldingMesa();
      this.removeLocalStoragePedidoClienteHoldingReferencia();

      console.log('setMarcarPedidoClientePagado', dataSend);
      this.crudService.postFree(dataSend, this.eventHttp, 'set-marcar-pedido-cliente-holding-pagado')
      .subscribe((res: any) => {
        console.log('setMarcarPedidoClientePagado', res);
      });
    }

}