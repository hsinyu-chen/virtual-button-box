import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IVjoyButtonBinding } from '../IVjoyButtonBinding';
import { VjoyService } from '../vjoy';

@Component({
  selector: 'app-button-binding',
  templateUrl: './button-binding.component.html',
  styleUrls: ['./button-binding.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonBindingComponent),
      multi: true
    }
  ]
})
export class ButtonBindingComponent implements OnInit, ControlValueAccessor {
  constructor(public vjoy: VjoyService) {

  }
  @Input() public disabled: boolean;
  @Input() public value: IVjoyButtonBinding = { deviceId: null, buttonId: null };
  valueChanged() {
    this.changed?.(this.value);
  }
  touched: () => void;
  changed: (value: any) => void;
  t() {
    this.touched?.();
  }
  writeValue(obj: IVjoyButtonBinding): void {
    this.value = obj ?? {} as any;
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
