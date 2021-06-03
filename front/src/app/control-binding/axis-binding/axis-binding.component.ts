import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Axis, AxisBindingType } from 'src/app/models/Axis';
import { IVjoyAxisBinding, IVjoyButtonBinding } from '../IVjoyButtonBinding';
import { VjoyService } from '../vjoy';

@Component({
  selector: 'app-axis-binding',
  templateUrl: './axis-binding.component.html',
  styleUrls: ['./axis-binding.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AxisBindingComponent),
      multi: true
    }
  ]
})
export class AxisBindingComponent implements OnInit, ControlValueAccessor {

  constructor(public vjoy: VjoyService) {

  }
  @Input() public disabled: boolean;
  @Input() public value: IVjoyAxisBinding = { deviceId: null, axis: null, type: AxisBindingType.Axis0to100 };
  Axis = Axis;
  Type = AxisBindingType;
  valueChanged() {
    this.changed?.(this.value);
  }
  touched: () => void;
  changed: (value: any) => void;
  t() {
    this.touched?.();
  }
  writeValue(obj: IVjoyAxisBinding): void {
    this.value = obj ?? { deviceId: null, axis: null, type: AxisBindingType.Axis0to100 } as any;
  }
  registerOnChange(fn: any): void {
    this.changed = fn;
  }
  registerOnTouched(fn: any): void {
    this.touched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
  }

}
