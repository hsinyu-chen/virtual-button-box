import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AxisBindingComponent } from './axis-binding.component';

describe('AxisBindingComponent', () => {
  let component: AxisBindingComponent;
  let fixture: ComponentFixture<AxisBindingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AxisBindingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AxisBindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
