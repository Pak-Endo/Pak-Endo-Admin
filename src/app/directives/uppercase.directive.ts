import { Directive, ElementRef,HostListener } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
  standalone: true
})
export class UppercaseDirective {

  constructor(private el: ElementRef) { }
  
  @HostListener('keyup', ['$event.target.value'])
  onInput(value: string) {
    if (value) {
      const transformedValue = value.charAt(0).toUpperCase() + value.slice(1);
      this.el.nativeElement.value = transformedValue;
    }
  }

}
