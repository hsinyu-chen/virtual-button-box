import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from './confirm/confirm.component';

@Injectable()
export class Confirm {
  constructor(private dialog: MatDialog) { }
  open(message: string): Promise<boolean> {
    return new Promise(done => {
      this.dialog.open(ConfirmComponent, { data: message }).afterClosed().subscribe(ok => done(ok));
    });
  }
}
