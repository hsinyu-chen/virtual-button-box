import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonBindingComponent } from './button-binding/button-binding.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AxisBindingComponent } from './axis-binding/axis-binding.component';



@NgModule({
  declarations: [
    ButtonBindingComponent,
    AxisBindingComponent
  ],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule
  ],
  exports: [
    ButtonBindingComponent,
    AxisBindingComponent
  ]
})
export class ControlBindingModule { }
