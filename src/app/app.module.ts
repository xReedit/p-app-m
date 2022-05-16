import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { GlobalErrorHandler } from './shared/services/error.global.handler';
import { environment } from '../environments/environment';
import { SocketIoModule } from 'ngx-socket-io';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
// import { AgmCoreModule } from '@agm/core';
// import { DirectionsMapDirectiveDirective } from './shared/directivas/directions-map-directive.directive';


@NgModule({
  declarations: [
    AppComponent,
    // DirectionsMapDirectiveDirective,
    // DebounceClickDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    // SharedModule,
    // ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    CoreModule,
    SocketIoModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    // AgmCoreModule.forRoot({
    //   apiKey: 'AIzaSyAknWQFyVH1RpR2OAL0vRTHTapaIpfKSqo',
    //   libraries: ['places']
    // }),
    // ServiceWorkerModule.register('assets/js/custom-service-worker.js', { enabled: environment.production })
  ],
  providers: [
    // {provide: ErrorHandler, useClass: GlobalErrorHandler},
    {provide: LocationStrategy, useClass: PathLocationStrategy} // 22012022 eliminar el #
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
