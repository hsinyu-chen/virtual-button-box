import { Location } from '@angular/common';
import { Component, ElementRef, forwardRef, HostBinding, HostListener, OnInit, Optional } from '@angular/core';
import { ControlComponentBase, Panel } from 'src/app/control/control.component';
import { App } from 'src/app/services/App';
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
  start(e: MouseEvent | TouchEvent) {
    if (!this.press && e.target && (e.target as Element).tagName.toUpperCase() == 'RECT') {
      this.press = true;
      if (e.isTrusted && this.app.settings.enableVibrate) {
        window.navigator.vibrate(10)
      }
    }
  }
  @HostListener('window:mouseup')
  @HostListener('touchend')
  end() {
    if (this.press) {
      this.press = false;
    }
  }
  constructor(private location: Location, @Optional() public setting: ButtonSetting, public panel: Panel, public app: App) {
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
