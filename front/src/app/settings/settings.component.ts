import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { App } from '../services/App';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  devices = [];
  message: string;
  loading = false;
  maxButton = 0;
  maxAxis = 0;
  maxPov = 0;
  constructor(private http: HttpClient, public app: App) {
    this.update();
  }
  setDeviceUse(id: number, use: boolean) {
    this.loading = true;
    if (use) {
      this.http.post(`/api/vjoy/${id}`, {}).subscribe(() => this.update());
    } else {
      this.http.delete(`/api/vjoy/${id}`).subscribe(() => this.update());
    }
  }
  create(id: number) {
    if (confirm('confirm device creation')) {
      this.loading = true;
      this.http.post(`/api/vjoy/hw/${id}`, {}).subscribe(() => this.setDeviceUse(id, true), () => this.loading = false);
    }
  }
  del(id: number) {
    if (confirm('confirm device deletion')) {
      this.loading = true;
      this.http.delete(`/api/vjoy/hw/${id}`).subscribe(() => this.setDeviceUse(id, false), () => this.loading = false);
    }
  }
  update() {
    this.loading = true;
    this.http.get('/api/vjoy').subscribe((data: any) => {
      this.maxAxis = 0;
      this.maxButton = 0;
      this.maxPov = 0;
      if (data.installed) {
        this.message = null;
        this.devices = data.vjoys;
        const u = this.devices.filter(x => x.used).length;
        data.details.forEach(d => {
          this.maxButton += d.buttons;
          this.maxAxis += d.axes.length;
          this.maxPov += d.descretePov;
        });
      } else {

        this.message = data.message;
      }
      this.loading = false;
    }, () => this.loading = false);
  }

  ngOnInit(): void {
  }

}
