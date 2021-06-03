import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ControlDefine, Panel } from 'src/app/control/control.component';
import { SelectControlPreviewComponent } from '../select-control-preview/select-control-preview.component';

@Component({
  selector: 'app-select-control',
  templateUrl: './select-control.component.html',
  styleUrls: ['./select-control.component.scss']
})
export class SelectControlComponent implements OnInit {

  injector: Injector;
  constructor(injector: Injector, @Inject(ControlDefine) public controls: ControlDefine[], private dialog: MatDialog, private ref: MatDialogRef<any>) {
    this.injector = Injector.create({
      providers: [
        {
          provide: Panel,
          useValue: new Panel(true)
        }
      ],
      parent: injector
    })
  }

  ngOnInit(): void {
  }
  openSetting(def: ControlDefine) {
    this.dialog.open(SelectControlPreviewComponent, {
      width: '95vw',
      height: '95vh',
      data: {
        def: def,
        setting: new def.settingType(),
        panel: new Panel(true)
      }
    }).afterClosed().subscribe(c => {
      if (c) {
        this.ref.close(c);
      }
    });
  }
}
