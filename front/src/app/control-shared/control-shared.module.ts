import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { RouterModule } from '@angular/router';
import { ControlButtonModule } from '../control-button/control-button.module';
import { SelectControlComponent } from './select-control/select-control.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SelectControlPreviewComponent } from './select-control-preview/select-control-preview.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { HelpComponent } from './help/help.component';



@NgModule({
  declarations: [
    LayoutComponent,
    SelectControlComponent,
    SelectControlPreviewComponent,
    HelpComponent
  ],
  imports: [
    CommonModule,
    ControlButtonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    MatCheckboxModule,
    MatSelectModule,
    RouterModule.forChild([
      {
        path: ':id', component: LayoutComponent
      }
    ]),
    ControlButtonModule.forRoot()
  ]
})
export class ControlSharedModule {


}
