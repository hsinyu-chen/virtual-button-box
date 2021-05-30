import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appBadgeIcon]'
})
export class BadgeIconDirective implements OnInit, OnDestroy, OnChanges {

  element;
  text;
  @Input('appBadgeIcon') icon;
  @Input('appBadgeColor') color;
  constructor(private el: ElementRef, private renderer2: Renderer2) { }
  ngOnInit() {
    if (this.el.nativeElement) {
      this.element = this.renderer2.createElement('i');
      this.renderer2.addClass(this.element, 'material-icons');
      this.renderer2.addClass(this.element, 'app-badge-icon');
      this.setText();
      this.setColor();
      this.renderer2.appendChild(this.el.nativeElement, this.element);
    }
  }
  private setColor() {
    if (this.element) {
      this.renderer2.addClass(this.element, 'app-color-' + this.color);
    }
  }
  private setText() {
    if (this.element) {
      if (this.text) {
        this.renderer2.removeChild(this.element, this.text);
      }
      if (this.icon) {
        this.text = this.renderer2.createText(this.icon || '');
        this.renderer2.appendChild(this.element, this.text);
      }
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if ('icon' in changes) {
      this.setText();
    }
    if ('color' in changes) {
      this.setColor();
    }
  }
  ngOnDestroy() {
    if (this.element) {
      this.renderer2.removeChild(this.el.nativeElement, this.element);
    }
  }
}
