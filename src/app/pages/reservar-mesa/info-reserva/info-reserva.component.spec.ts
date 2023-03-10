import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InfoReservaComponent } from './info-reserva.component';

describe('InfoReservaComponent', () => {
  let component: InfoReservaComponent;
  let fixture: ComponentFixture<InfoReservaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoReservaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
