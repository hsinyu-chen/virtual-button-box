import { Component, ElementRef, HostListener, Inject, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ControlDefine, Panel } from 'src/app/control/control.component';
import { Controls } from 'src/app/models/Controls';
import { Layout } from 'src/app/models/Layout';
import { App } from 'src/app/services/App';
import { SelectControlPreviewComponent } from '../select-control-preview/select-control-preview.component';
import { SelectControlComponent } from '../select-control/select-control.component';

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
  start: { x: number, y: number };
  width: number;
  height: number;
  left: number;
  top: number;
  moving: Controls;
  zooming: Controls;
  ow: number;
  oh: number;
  selected: Controls;
  touchstart(e: TouchEvent) {
    const b = (this.elementRef.nativeElement as HTMLElement).getBoundingClientRect();
    this.width = b.width;
    this.height = b.height;
    this.left = b.left;
    this.top = b.top;
    this.start = { x: e.touches[0].pageX, y: e.touches[0].pageY };
  }
  @HostListener('touchend')
  touchend() {
    if (this.moving || this.zooming) {
      this.app.saveChanges();
    }
    this.zooming = undefined;
    this.moving = undefined;
  }
  @HostListener('touchmove', ['$event'])
  touchmove(e: TouchEvent) {
    if (this.moving) {
      const hw = (this.moving.width / 2);
      const hh = (this.moving.height / 2);
      let leftd = (((e.touches[0].pageX - this.left) / this.width) * 100) - hw;
      let topd = (((e.touches[0].pageY - this.top) / this.height) * 100) - hh;
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
      this.moving.x = leftd;
      this.moving.y = topd;
    } else if (this.zooming) {
      let w = ((e.touches[0].pageX - this.start.x) / this.width) * 100 + this.ow;
      let h = ((e.touches[0].pageY - this.start.y) / this.height) * 100 + this.oh;
      if ((this.zooming.x + w) > 100) {
        w = 100 - this.zooming.x;
      }
      if (w < 10) {
        w = 10;
      }
      if ((this.zooming.y + h) > 100) {
        h = 100 - this.zooming.y;
      }
      if (h < 10) {
        h = 10;
      }
      this.zooming.width = w;
      this.zooming.height = h;
    }
  }
  layout: Layout;
  editing = false;
  map: { [key: string]: ControlDefine };
  destory = new Subject();
  injectedControls: { injector: Injector, control: Controls, checked: boolean }[] = [];
  constructor(private injector: Injector, private router: Router, private elementRef: ElementRef, public app: App, @Inject(ControlDefine) public controls: ControlDefine[], public route: ActivatedRoute, private dialog: MatDialog) {
    combineLatest([route.params, app.currentSettings]).pipe(takeUntil(this.destory)).subscribe(o => this.getLayout(o[0].id));
    route.params.subscribe(() => {
      this.editing = false;
    })
    this.map = {}
    this.controls.forEach(x => this.map[x.name] = x);
  }
  checked() {
    return this.injectedControls.filter(x => x.checked);
  }
  clear() {
    this.injectedControls.forEach(x => x.checked = false);
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
    if (confirm('confirm delete?')) {
      this.app.settings.layouts = this.app.settings.layouts.filter(x => x !== this.layout);
      const next = this.app.settings.layouts[0];
      if (next) {
        this.router.navigate(['/layout', next.id]);
      } else {
        this.router.navigate(['/']);
      }
    }
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
  move(c: Controls, e: TouchEvent) {
    this.touchstart(e);
    this.moving = c;
    this.zooming = undefined;
  }
  zoom(c: Controls, e: TouchEvent) {
    this.touchstart(e);
    this.ow = c.width;
    this.oh = c.height;
    this.zooming = c;
    this.moving = undefined;
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
      width: '80vw',
      height: '80vh'
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
      width: '80vw',
      height: '80vh',
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
}
