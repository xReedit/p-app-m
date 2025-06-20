import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';

const routes: Routes = [{
    path: '', component: MainComponent,
    data: { titulo: 'Marcas' },
    children: [
        {
            path: '', redirectTo: 'marcas'
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HoldingRoutingModule { }