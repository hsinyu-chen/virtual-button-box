import { Component, OnInit } from '@angular/core';
import { ControlSettongComponentBase } from 'src/app/control/control.component';
import { ButtonSetting } from '../ButtonSetting';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent extends ControlSettongComponentBase<ButtonSetting> implements OnInit {

  constructor(public setting: ButtonSetting) {
    super(setting);
  }

  ngOnInit(): void {
  }

}
