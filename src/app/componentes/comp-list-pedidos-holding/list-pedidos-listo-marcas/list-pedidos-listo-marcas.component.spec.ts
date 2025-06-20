import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPedidosListoMarcasComponent } from './list-pedidos-listo-marcas.component';

describe('ListPedidosListoMarcasComponent', () => {
  let component: ListPedidosListoMarcasComponent;
  let fixture: ComponentFixture<ListPedidosListoMarcasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPedidosListoMarcasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPedidosListoMarcasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
