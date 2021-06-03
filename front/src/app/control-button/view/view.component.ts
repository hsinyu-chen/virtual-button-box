import { Location } from '@angular/common';
import { Component, ElementRef, forwardRef, HostBinding, HostListener, OnDestroy, OnInit, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { VjoyService } from 'src/app/control-binding/vjoy';
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
export class ViewComponent extends ControlComponentBase implements OnInit, OnDestroy {
  press = false;
  trackId: number;
  trigger = ['circle', 'rect', 'ellipse']
  vibrating = false;
  destory = new Subject();
  sendTask: Promise<any> = Promise.resolve();
  push = new Subject<boolean>();
  ngOnDestroy() {
    this.destory.next();
    this.destory.complete();
  }
  async start(e: MouseEvent | TouchEvent) {
    if (!this.press && e.target && this.trigger.includes((e.target as Element).tagName.toLowerCase())) {
      e.preventDefault();
      console.log(e['changedTouches']);
      this.trackId = e instanceof MouseEvent ? -1 : e.changedTouches[0].identifier;
      this.press = true;
      this.push.next(true);
      if (e.isTrusted && this.app.settings.enableVibrate) {
        try {
          if (!this.vibrating) {
            window.navigator.vibrate([0, 20, 10])
            setTimeout(() => this.vibrating = false, 60);
          }
        } catch {

        }
      }
    }
  }
  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  async end(e: MouseEvent | TouchEvent) {
    const id = e instanceof MouseEvent ? -1 : e.changedTouches[0].identifier;
    if (this.press && this.trackId == id) {
      e.preventDefault();
      this.press = false;
      this.push.next(false);
    }
  }
  constructor(private location: Location, @Optional() public setting: ButtonSetting, public panel: Panel, public app: App, public vojy: VjoyService) {
    super(panel);
    if (!this.setting) {
      this.setting = new ButtonSetting();
    }
    this.push.pipe(takeUntil(this.destory), debounceTime(20)).subscribe(async v => {
      if (this.setting.binding?.buttonId && this.setting.binding?.deviceId) {
        await this.sendTask;
        this.sendTask = this.vojy.setButtonState(this.setting.binding.deviceId, this.setting.binding.buttonId, v);
      }
    })
    const t = setInterval(() => {
      this.push.next(this.press);
    }, 500);
    this.destory.subscribe(() => {
      clearInterval(t);
    })
  }
  url(id: string) {
    return `url(${this.location.path()}${id}`;
  }
  ngOnInit(): void {
  }

}
