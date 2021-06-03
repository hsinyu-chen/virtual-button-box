import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewComponent } from './view/view.component';
import { SettingComponent } from './setting/setting.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ControlBindingModule } from '../control-binding/control-binding.module';
import { ControlDefine } from '../control/control.component';
import { ThrottleSetting } from './ThrottleSetting';
import { AxisBindingComponent } from '../control-binding/axis-binding/axis-binding.component';



@NgModule({
  declarations: [
    ViewComponent,
    SettingComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatRadioModule,
    ControlBindingModule
  ]
})
export class ControlThrottleModule {
  static forRoot(): ModuleWithProviders<ControlThrottleModule> {
    return {
      ngModule: ControlThrottleModule,
      providers: [
        {
          multi: true,
          provide: ControlDefine,
          useValue: new ControlDefine(ViewComponent, SettingComponent, ThrottleSetting, 'throttle')
        }
      ]
    }
  }
}
