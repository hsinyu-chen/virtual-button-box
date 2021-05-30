import { AfterViewChecked, AfterViewInit, Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ControlComponentBase, ControlDefine, Panel } from 'src/app/control/control.component';
import { Controls } from 'src/app/models/Controls';

@Component({
  selector: 'app-select-control-preview',
  templateUrl: './select-control-preview.component.html',
  styleUrls: ['./select-control-preview.component.scss']
})
export class SelectControlPreviewComponent implements OnInit {

  injector: Injector;
  setting: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: { def: ControlDefine, setting: any, panel: Panel }, private cinjector: Injector) {
    this.setting = data.setting;
    this.injector = Injector.create({
      providers: [{
        provide: data.def.settingType,
        useValue: this.setting
      },
      {
        provide: Panel,
        useValue: this.data.panel
      }],
      parent: this.cinjector
    });
  }
  ngOnInit(): void {
  }
  getData() {
    const c = new Controls();
    c.type = this.data.def.name;
    c.setting = this.setting;
    return c;
  }
}
