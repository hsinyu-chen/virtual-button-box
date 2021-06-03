import { Component, ElementRef, HostListener, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VjoyService } from 'src/app/control-binding/vjoy';
import { ControlDefine, Panel } from 'src/app/control/control.component';
import { Confirm } from 'src/app/helpers/confirm.service';
import { Controls } from 'src/app/models/Controls';
import { Layout } from 'src/app/models/Layout';
import { App } from 'src/app/services/App';
import { HelpComponent } from '../help/help.component';
import { SelectControlPreviewComponent } from '../select-control-preview/select-control-preview.component';
import { SelectControlComponent } from '../select-control/select-control.component';
type InactiveData = {
  start?: { x: number, y: number };
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  moving?: Controls;
  zooming?: Controls;
  ow?: number;
  oh?: number;
};
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy, Panel {
  icons = [
    'gamepad',
    'videogame_asset',
    'sports_esports',
    'flight',
    'local_shipping',
    'train',
    'directions_boat',
    'directions_car',
    'looks_one',
    'looks_two',
    'looks_3',
    'looks_4',
    'looks_5',
    'looks_6'
  ]
  inactivating: {
    [id: number]: InactiveData
  } = {};


  selected: Controls;
  touchstart(e: TouchEvent | MouseEvent, clientX: number, clientY: number, id: number) {
    const data = this.inactivating[id];
    if (data) {
      const b = (this.elementRef.nativeElement as HTMLElement).getBoundingClientRect();
      data.width = b.width;
      data.height = b.height;
      data.left = b.left;
      data.top = b.top;
      data.start = { x: clientX, y: clientY };
    }
  }
  private getData(id: number) {
    if (!this.inactivating[id]) {
      this.inactivating[id] = {};
    }
    return this.inactivating[id];
  }

  @HostListener('window:mouseup', ['$event'])
  @HostListener('window:touchend', ['$event'])
  touchend(e: TouchEvent) {
    if (!this.editing) return;
    this.multiTouch(e, (data, clientX, clientY, id, ev) => {
      if (data.moving || data.zooming) {
        ev.preventDefault();
        this.app.saveChanges();
        data.zooming = undefined;
        data.moving = undefined;
        delete this.inactivating[id];
      }
    });
  }
  multiTouch(e: TouchEvent | MouseEvent, action: (data: InactiveData, clientX: number, clientY: number, id: number, e: TouchEvent | MouseEvent) => void) {
    if (e instanceof MouseEvent) {
      action(this.getData(-1), e.clientX, e.clientY, -1, e);
    } else {
      for (let i = 0, c = e.changedTouches.length; i < c; i++) {
        const touch = e.changedTouches.item(i);
        action(this.getData(touch.identifier), touch.clientX, touch.clientY, touch.identifier, e);
      }
    }
  }
  @HostListener('window:touchmove', ['$event'])
  @HostListener('window:mousemove', ['$event'])
  touchmove(e: TouchEvent | MouseEvent) {
    if (!this.editing) return;
    this.multiTouch(e, (data, clientX, clientY, id, ev) => {
      if (data.moving) {
        ev.preventDefault();
        const hw = (data.moving.width / 2);
        const hh = (data.moving.height / 2);
        let leftd = (((clientX - data.left) / data.width) * 100) - hw;
        let topd = (((clientY - data.top) / data.height) * 100) - hh;
        if (leftd < 0) {
          leftd = 0;
        }
        if (topd < 0) {
          topd = 0;
        }
        if (topd > (100 - hh - hh)) {
          topd = (100 - hh - hh);
        }
        if (leftd > (100 - hw - hw)) {
          leftd = (100 - hw - hw);
        }
        data.moving.x = leftd;
        data.moving.y = topd;
      } else if (data.zooming) {
        ev.preventDefault();
        let w = ((clientX - data.start.x) / data.width) * 100 + data.ow;
        let h = ((clientY - data.start.y) / data.height) * 100 + data.oh;
        if ((data.zooming.x + w) > 100) {
          w = 100 - data.zooming.x;
        }
        if (w < 10) {
          w = 10;
        }
        if ((data.zooming.y + h) > 100) {
          h = 100 - data.zooming.y;
        }
        if (h < 10) {
          h = 10;
        }
        data.zooming.width = w;
        data.zooming.height = h;
      }
    });
  }
  layout: Layout;
  editing = false;
  map: { [key: string]: ControlDefine };
  destory = new Subject();
  injectedControls: { injector: Injector, control: Controls, checked: boolean }[] = [];
  wakeLock: any = null;
  constructor(private voj: VjoyService, private injector: Injector, private confirm: Confirm, private router: Router, private elementRef: ElementRef, public app: App, @Inject(ControlDefine) public controls: ControlDefine[], public route: ActivatedRoute, private dialog: MatDialog) {
    this.voj.update()
    this.map = {}
    this.controls.forEach(x => this.map[x.name] = x);
    combineLatest([route.params, app.currentSettings]).pipe(takeUntil(this.destory)).subscribe(o => this.getLayout(o[0].id));
    route.params.subscribe(() => {
      this.editing = false;
    });
    this.destory.subscribe(() => {
      if (this.wakeLock) {
        this.wakeLock.release();
      }
    });
    this.wakeLockRequest();

  }

  @HostListener('window:click')
  public wakeLockRequest() {
    if (this.wakeLock) {
      return;
    }
    if ('wakeLock' in navigator) {
      ((navigator as any).wakeLock.request('screen') as Promise<any>).then((wakelock) => {
        this.wakeLock = wakelock;
        console.log('wakeLock screen');
        wakelock.addEventListener('release', () => {
          if (this.wakeLock === wakelock) {
            this.wakeLock = undefined;
          }
        })
      });
    }
  }

  checked() {
    return this.injectedControls.filter(x => x.checked);
  }
  clear() {
    this.injectedControls.forEach(x => x.checked = false);
  }
  remove() {
    const targets = this.injectedControls.filter(x => x.checked);
    if (targets.length) {
      for (const t of targets) {
        this.layout.controls.splice(this.layout.controls.findIndex(x => x === t.control), 1);
      }
      this.app.saveChanges()
    }
  }
  evenH() {
    const targets = this.injectedControls.filter(x => x.checked).map(x => x.control).sort((a, b) => a.y - b.y);
    if (targets.length > 2) {
      const last = targets[targets.length - 1];
      const first = targets[0];
      const top = first.y;
      const bottom = last.y + last.height;
      const totalSpace = targets.reduce((a, b) => a - b.height, bottom - top);
      const oneSpace = totalSpace / (targets.length - 1);
      let cur = top + first.height;
      for (const c of targets) {
        if (c !== first && c != last) {
          cur += oneSpace;
          c.y = cur;
          cur += c.height;
        }
      }
      this.app.saveChanges();
    }
  }
  evenW() {
    const targets = this.injectedControls.filter(x => x.checked).map(x => x.control).sort((a, b) => a.x - b.x);
    if (targets.length > 2) {
      const last = targets[targets.length - 1];
      const first = targets[0];
      const left = first.x;
      const right = last.x + last.width;
      const totalSpace = targets.reduce((a, b) => a - b.width, right - left);
      const oneSpace = totalSpace / (targets.length - 1);
      let cur = left + first.width;
      for (const c of targets) {
        if (c !== first && c != last) {
          cur += oneSpace;
          c.x = cur;
          cur += c.width;
        }
      }
      this.app.saveChanges();
    }
  }
  align(type: 'x' | 'y') {
    if (this.selected) {
      this.injectedControls.forEach(c => {
        if (c.checked && c.control !== this.selected) {
          c.control[type] = this.selected[type];
        }
      })
      this.app.saveChanges();
    }
  }
  setSize() {
    if (this.selected) {
      this.injectedControls.forEach(c => {
        if (c.checked && c.control !== this.selected) {
          c.control.height = this.selected.height;
          c.control.width = this.selected.width;
        }
      })
      this.app.saveChanges();
    }
  }
  deleteLayout() {
    this.confirm.open('confirm delete?').then(ok => {
      if (ok) {
        this.app.settings.layouts = this.app.settings.layouts.filter(x => x !== this.layout);
        const next = this.app.settings.layouts[0];
        if (next) {
          this.router.navigate(['/layout', next.id]);
        } else {
          this.router.navigate(['/']);
        }
      }
    })

  }
  ngOnDestroy() {
    this.destory.next();
    this.destory.complete();
  }
  getLayout(id: string) {
    this.layout = this.app.settings.layouts.find(x => x.id == id);
    if (this.layout) {
      this.layout.controls.forEach(x => {
        if (!x.height) {
          x.height = 20;
        }
        if (!x.width) {
          x.width = 20;
        }
      })
      const old = this.injectedControls;
      this.injectedControls = this.layout.controls.map(x => ({
        injector: this.getInjector(x),
        control: x,
        checked: old.find(z => z.control === x)?.checked ?? false
      }));
    } else {
      this.injectedControls = [];
    }
  }
  ngOnInit(): void {
  }
  move(c: Controls, e: TouchEvent | MouseEvent) {
    this.multiTouch(e, (data, x, y, id, ev) => {
      if (!data.moving) {
        ev.preventDefault();
        this.touchstart(e, x, y, id);
        data.moving = c;
        data.zooming = undefined;
      }
    });

  }
  zoom(c: Controls, e: TouchEvent | MouseEvent) {
    this.multiTouch(e, (data, x, y, id, ev) => {
      if (!data.zooming) {
        ev.preventDefault();
        this.touchstart(e, x, y, id);
        data.ow = c.width;
        data.oh = c.height;
        data.zooming = c;
        data.moving = undefined;
      }
    });
  }
  getInjector(c: Controls) {
    return Injector.create({
      providers: [
        {
          provide: this.map[c.type].settingType,
          useValue: c.setting
        },
        {
          provide: Panel,
          useValue: this
        }
      ],
      parent: this.injector
    })
  }
  add() {
    this.dialog.open(SelectControlComponent, {
      width: '95vw',
      height: '95vh'
    }).afterClosed().subscribe(x => {
      if (x) {
        x.width = 20;
        x.height = 20;
        this.layout.controls.push(x);
        this.app.saveChanges();
      }
    });
  }
  openSetting(c: Controls) {
    this.dialog.open(SelectControlPreviewComponent, {
      width: '95vw',
      height: '95vh',
      data: {
        def: this.map[c.type],
        setting: JSON.parse(JSON.stringify(c.setting)),
        panel: this
      }
    }).afterClosed().subscribe(nc => {
      if (nc) {
        c.setting = nc.setting;
        this.app.saveChanges();
      }
    });
  }
  help() {
    this.dialog.open(HelpComponent, { height: '90vh' });
  }
}
