import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { App } from '../services/App';
import { v4 } from 'uuid';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  devices = [];
  hasEmpty = false;
  constructor(private http: HttpClient, private dialog: MatDialog, public app: App) {

  }
  newCanvas() {
    this.app.settings.layouts.push({
      id: v4(),
      controls: [],
      icon: 'gamepad'
    })
  }
  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen()
    }
  }
  ngOnInit(): void {
  }

}
