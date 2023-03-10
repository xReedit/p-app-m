import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CompCtrlAddFastComponent } from './comp-ctrl-add-fast.component';

describe('CompCtrlAddFastComponent', () => {
  let component: CompCtrlAddFastComponent;
  let fixture: ComponentFixture<CompCtrlAddFastComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CompCtrlAddFastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompCtrlAddFastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
