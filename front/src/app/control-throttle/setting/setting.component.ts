import { Component, OnInit } from '@angular/core';
import { ControlSettongComponentBase } from 'src/app/control/control.component';
import { ThrottleSetting } from '../ThrottleSetting';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent extends ControlSettongComponentBase<ThrottleSetting> implements OnInit {

  constructor(public setting: ThrottleSetting) {
    super(setting);
  }

  ngOnInit(): void {
  }

}
