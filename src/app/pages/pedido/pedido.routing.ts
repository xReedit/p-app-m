import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { InicioComponent } from './inicio/inicio.component';
import { CartaComponent } from './carta/carta.component';
import { BusquedaComponent } from './busqueda/busqueda.component';
import { MarcasComponent } from './holding/marcas/marcas.component';
// import { PagarCuentaComponent } from './pagar-cuenta/pagar-cuenta.component';


const routes: Routes = [{
    path: '', component: MainComponent,
    data: { titulo: 'Pedido' },
    children: [     
        {
            path: 'holding',
            component: MarcasComponent,
            data: { titulo: 'Marcas' }
        },   
        {
            path: 'lacarta/:id',
            component: CartaComponent,
            data: { titulo: 'Carta' }
        },
          
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PedidoRoutingModule { }
