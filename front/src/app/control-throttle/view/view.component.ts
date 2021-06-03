import { Location } from '@angular/common';
import { Component, ElementRef, forwardRef, HostBinding, HostListener, OnDestroy, OnInit, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { VjoyService } from 'src/app/control-binding/vjoy';
import { ControlComponentBase, Panel } from 'src/app/control/control.component';
import { AxisBindingType } from 'src/app/models/Axis';
import { App } from 'src/app/services/App';
import { ThrottleSetting } from '../ThrottleSetting';

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
  trackId: number;
  vibrating = false;
  destory = new Subject();
  sendTask: Promise<any> = Promise.resolve();
  push = new Subject<number>();
  lines = [];
  rY = 0;
  sY = 0;
  scY = 0;
  pOffset = 0;
  value = 0;
  isTouch = false;
  eh: number;
  static line;
  ngOnDestroy() {
    this.destory.next();
    this.destory.complete();
  }
  async start(e: MouseEvent | TouchEvent) {
    if (e.cancelable) {
      e.preventDefault();
    }
    this.isTouch = e instanceof TouchEvent;
    if (this.isTouch && e instanceof MouseEvent) return;
    this.trackId = e instanceof MouseEvent ? -1 : e.changedTouches[0].identifier;
    this.scY = e instanceof MouseEvent ? e.clientY : e.changedTouches[0].clientY;
    this.sY = this.rY;
    this.eh = (this.elementRef.nativeElement as HTMLElement).querySelector('.vl-h').getBoundingClientRect().height;
  }
  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  move(e: MouseEvent | TouchEvent) {
    if (this.trackId === undefined || this.isTouch && e instanceof MouseEvent) return;
    let cy: number;
    if (e instanceof TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.targetTouches.item(i);
        if (t.identifier == this.trackId) {
          cy = t.clientY
          break;
        }
      }
    } else {
      cy = e.clientY;
    }
    const d = (cy - this.scY);
    const dp = ((d * 100) / (this.eh));
    this.rY = this.sY + (dp * -8);
    if (this.rY > 800) this.rY = 800;
    if (this.rY < 0) this.rY = 0;
    const vp = (this.rY / 800);
    this.value = vp * 100;
    this.pOffset = Math.log((vp + 1)) * 70;
    this.push.next(this.value);
  }
  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  async end(e: MouseEvent | TouchEvent) {
    if (this.isTouch && e instanceof MouseEvent) return;
    this.trackId = undefined;
  }
  constructor(private elementRef: ElementRef, private location: Location, @Optional() public setting: ThrottleSetting, public panel: Panel, public app: App, public vojy: VjoyService) {
    super(panel);
    if (!ViewComponent.line) {
      ViewComponent.line = [];
      let total = 800;
      let step = 40;
      let d = total / step;
      for (let i = 0; i <= step; i++) {
        const offset = Math.log(((i / step) + 1)) * 70;
        ViewComponent.line.push({
          y: 100 + (i * d),
          lx: offset + 30,
          rx: 170 - offset
        });
      }
    }
    this.lines = ViewComponent.line;
    if (!this.setting) {
      this.setting = new ThrottleSetting();
    }
    this.push.pipe(takeUntil(this.destory), debounceTime(1)).subscribe(async v => {
      if (this.setting.binding?.axis && this.setting.binding?.deviceId) {
        if (this.setting.binding.type == AxisBindingType.Axis50to100) {
          v = Math.round(((v / 100) * 50)) + 50;
        } else if (this.setting.binding.type == AxisBindingType.Axis50to0) {
          v = 50 - Math.round((v / 100) * 50)
        } else if (this.setting.binding.type == AxisBindingType.Axis100to0) {
          v = 100 - v;
        }

        await this.sendTask;
        this.sendTask = this.vojy.setAxisState(this.setting.binding.deviceId, this.setting.binding.axis, Math.round((0x8000 * v) / 100));
      }
    })

    const t = setInterval(() => {
      this.push.next(this.value);
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
