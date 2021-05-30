import { Location } from '@angular/common';
import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { App } from './services/App';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  t;
  @HostBinding('class.active') actived = true;
  @HostListener('window:click')
  @HostListener('window:mousemove')
  @HostListener('window:touchstart')
  active() {
    this.actived = true;
    if (this.t) {
      clearTimeout(this.t);
      this.t = undefined;
    }
    this.t = setTimeout(() => {
      this.actived = !this.app.settings.oledProtect;
    }, 3000);

  }
  constructor(private app: App, private router: Router, private location: Location) {
    const lastRoute = localStorage.getItem('route');
    if (lastRoute) {
      router.navigateByUrl(lastRoute);
    }
    router.events.subscribe(ev => {
      if (ev instanceof ActivationEnd) {
        localStorage.setItem('route', this.location.path(true));
      }
    });

  }
  ngOnInit() {
    this.active();
  }
}
