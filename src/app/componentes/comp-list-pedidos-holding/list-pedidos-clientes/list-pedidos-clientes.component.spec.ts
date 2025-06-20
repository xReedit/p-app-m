import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPedidosClientesComponent } from './list-pedidos-clientes.component';

describe('ListPedidosClientesComponent', () => {
  let component: ListPedidosClientesComponent;
  let fixture: ComponentFixture<ListPedidosClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPedidosClientesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPedidosClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
