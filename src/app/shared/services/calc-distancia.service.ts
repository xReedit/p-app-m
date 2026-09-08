import { Injectable } from '@angular/core';
import { DeliveryDireccionCliente } from 'src/app/modelos/delivery.direccion.cliente.model';
import { DeliveryEstablecimiento } from 'src/app/modelos/delivery.establecimiento';
import { EstablecimientoService } from './establecimiento.service';
import { GeoPositionModel } from 'src/app/modelos/geoposition.model';
import { Observable } from 'rxjs/internal/Observable';

declare var google: any;

import {
  insideCircle, distanceTo
} from 'geolocation-utils';


@Injectable({
  providedIn: 'root'
})
export class CalcDistanciaService {
  // se crea al usarse: el script de Google Maps carga tarde y el servicio se inyecta en /pedido antes de eso



  constructor(
    private estableciminetoService: EstablecimientoService
  ) { }


  // para cacular al visualizar estableciminetos
  calculateRouteNoApi(dirCliente: DeliveryDireccionCliente, dirEstablecimiento: DeliveryEstablecimiento, buscarEnCache = true): any {
      let c_servicio = 0;
      c_servicio = dirEstablecimiento.c_minimo;

      const c_km = dirEstablecimiento.c_km; // costo x km adicional


      dirEstablecimiento.latitude = typeof dirEstablecimiento.latitude === 'string' ? parseFloat(dirEstablecimiento.latitude) : dirEstablecimiento.latitude;
      dirEstablecimiento.longitude = typeof dirEstablecimiento.longitude === 'string' ? parseFloat(dirEstablecimiento.longitude) : dirEstablecimiento.longitude;

      dirCliente.latitude = typeof dirCliente.latitude === 'string' ? parseFloat(dirCliente.latitude) : dirCliente.latitude;
      dirCliente.longitude = typeof dirCliente.longitude === 'string' ? parseFloat(dirCliente.longitude) : dirCliente.longitude;

      let km = 0;
      const distanciaMetros = distanceTo({lat: dirEstablecimiento.latitude, lon: dirEstablecimiento.longitude}, {lat: dirCliente.latitude, lon: dirCliente.longitude});
      const inKm = distanciaMetros / 1000;
      dirEstablecimiento.distancia_mt = distanciaMetros.toString();
      dirEstablecimiento.distancia_km = (inKm).toFixed(2);

      km = Math.ceil(inKm);

      c_servicio = this.calCostoDistancia(dirEstablecimiento, inKm);

      // console.log('establecimeinto', dirEstablecimiento.nombre);
      // console.log('km distancia', km);
      // console.log('metros distancia', distanciaMetros);

      // if ( km > 1 ) {
      //   // const kmAddicionales = km / 0.5
      //   const kmMenos = km > 2 ? 0 : 1; // si es mayor a 2 no resta
      //   c_servicio = (( km - kmMenos ) * c_km) + c_servicio;
      //   dirEstablecimiento.c_servicio = c_servicio;

      //   // console.log('c_servicio', c_servicio);
      //   // return c_servicio;
      // }

      dirEstablecimiento.c_servicio = c_servicio;
      return c_servicio;
  }


  // ponytail: sin Google Maps (la app mozo no hace delivery); distancia en linea recta.
  // Si algun dia se necesita ruta real, volver a un servicio de rutas aqui.
  calculateRoute(dirCliente: DeliveryDireccionCliente, dirEstablecimiento: DeliveryEstablecimiento, buscarEnCache: boolean = true): any {
    return this.calculateRouteNoApi(dirCliente, dirEstablecimiento, buscarEnCache);
  }

  calculateRouteObserver(dirCliente: DeliveryDireccionCliente, dirEstablecimiento: DeliveryEstablecimiento, buscarEnCache: boolean = true): Observable<DeliveryEstablecimiento> {
    return new Observable(observer => {
      this.calculateRouteNoApi(dirCliente, dirEstablecimiento, buscarEnCache);
      observer.next(dirEstablecimiento);
      observer.complete();
    });
  }

  // distancia_km > tambien del elemento cacheado
  calCostoDistancia(dirEstablecimiento: DeliveryEstablecimiento,  distancia_km: number): number {
    // console.log('distancia_km', distancia_km);
    const km = Math.ceil(distancia_km); // lo redondea
    const c_km = parseFloat(dirEstablecimiento.c_km.toString()); // costo x km adicional // puede variar
    let c_servicio = parseFloat(dirEstablecimiento.c_minimo.toString()); // puede variar

    let menosKm = 0;
    menosKm = km > 2 ? 2 : menosKm;
    menosKm = km > 5 ? 0 : menosKm; // si es mayor o igual  a 4 kilometros entonce no resta
    if ( km > 2 ) {
      c_servicio = (( km - menosKm ) * c_km) + c_servicio;
      dirEstablecimiento.c_servicio = c_servicio;
    }

    // console.log('calculando.. ', c_servicio);

    return c_servicio;
  }

  // regla x km adicional
  // private reglaKm() {

  // }


  // retorna true si esta cerca
  calcDistancia(coordOrigen: GeoPositionModel, coordDetino: GeoPositionModel): boolean {
    const center = {lat: coordDetino.latitude, lon: coordDetino.longitude };
    const radius = 75; // meters
    return insideCircle({lat: coordOrigen.latitude, lon: coordOrigen.longitude}, center, radius);  // false
  }

  // calcula la lluvia


  // calcula la distanca del establecimiento al ingresar a la carta para asegurar lo cacula con api google
  calcCostoEntregaApiGoogleRain(direccionCliente: DeliveryDireccionCliente, dirEstablecimiento: DeliveryEstablecimiento) {

    if ( !direccionCliente ) {return; }
    // buscamos en cache
    // const _establecimientoCache = this.estableciminetoService.getFindDirClienteCacheEstableciemto(direccionCliente, dirEstablecimiento);
    const _establecimientoCache = null;
    if ( _establecimientoCache ) {
      if ( !_establecimientoCache.isCalcApiGoogle ) {

        _establecimientoCache.isCalcApiGoogle = true;
        this.calculateRoute(direccionCliente, _establecimientoCache, false);
      } else {
        this.calculateRoute(direccionCliente, dirEstablecimiento, false);
      }
    } else {
      this.calculateRouteObserver(direccionCliente, dirEstablecimiento, false).subscribe(res => {
        // console.log('rpt calc', res);
      });
    }

  }


  // private setCacheDireccion(direccionCliente: DeliveryDireccionCliente, dirEstablecimiento: DeliveryEstablecimiento, costo: Number) {
  //   const c_km = parseFloat(dirEstablecimiento.c_km.toString()); // costo x km adicional // puede variar
  //   const c_servicio = parseFloat(dirEstablecimiento.c_minimo.toString()); // puede variar
  //   const coordenadas_cliente = direccionCliente.latitude + direccionCliente.longitude;
  //   const coordenadas_comercio = dirEstablecimiento.latitude + dirEstablecimiento.longitude;
  // }
}

