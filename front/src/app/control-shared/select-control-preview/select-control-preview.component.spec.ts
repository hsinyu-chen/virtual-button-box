import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectControlPreviewComponent } from './select-control-preview.component';

describe('SelectControlPreviewComponent', () => {
  let component: SelectControlPreviewComponent;
  let fixture: ComponentFixture<SelectControlPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectControlPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectControlPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
