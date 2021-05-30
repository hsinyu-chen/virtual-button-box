import { Location } from '@angular/common';
import { Component, forwardRef, HostBinding, HostListener, OnInit, Optional } from '@angular/core';
import { ControlComponentBase, Panel } from 'src/app/control/control.component';
import { ButtonSetting } from '../ButtonSetting';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  providers: [
    {
      provide: ControlComponentBase,
      useExisting: forwardRef(() => ViewComponent)
    }
  ]
})
export class ViewComponent extends ControlComponentBase implements OnInit {
  press = false;
  @HostListener('touchstart')
  start() {
    this.press = true;
  }
  @HostListener('touchend')
  end() {
    this.press = false;
  }
  constructor(private location: Location, @Optional() public setting: ButtonSetting, public panel: Panel) {
    super(panel);
    if (!this.setting) {
      this.setting = new ButtonSetting();
    }
  }
  url(id: string) {
    return `url(${this.location.path()}${id}`;
  }
  ngOnInit(): void {
  }

}
