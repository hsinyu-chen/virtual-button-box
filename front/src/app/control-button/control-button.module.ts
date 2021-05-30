import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlDefine } from '../control/control.component';
import { ViewComponent } from './view/view.component';
import { SettingComponent } from './setting/setting.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonSetting } from './ButtonSetting';


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
    MatRadioModule
  ]
})
export class ControlButtonModule {
  static forRoot(): ModuleWithProviders<ControlButtonModule> {
    return {
      ngModule: ControlButtonModule,
      providers: [
        {
          multi: true,
          provide: ControlDefine,
          useValue: new ControlDefine(ViewComponent, SettingComponent, ButtonSetting, 'button')
        }
      ]
    }
  }
}
