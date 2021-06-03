import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBindingComponent } from './button-binding.component';

describe('ButtonBindingComponent', () => {
  let component: ButtonBindingComponent;
  let fixture: ComponentFixture<ButtonBindingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonBindingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonBindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
