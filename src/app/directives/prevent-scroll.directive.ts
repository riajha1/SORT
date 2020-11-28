import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appScroller]'
})
export class ScrollerDirective {

  @HostListener('mousedown', ['$event']) mousedown($event: Event): void{
    $event.preventDefault();
  }
}
