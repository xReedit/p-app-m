import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingMarcasComponent } from './marcas.component';

describe('HoldingMarcasComponent', () => {
  let component: HoldingMarcasComponent;
  let fixture: ComponentFixture<HoldingMarcasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldingMarcasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoldingMarcasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
