import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-instructivo',
  templateUrl: './instructivo.component.html',
  styleUrls: ['./instructivo.component.css'],
})
export class InstructivoComponent {
  anio = new Date();

  constructor(private router: Router, private elementRef: ElementRef) {}

  scrollToSection(sectionId: string) {
    const section = this.elementRef.nativeElement.querySelector(
      '#' + sectionId
    );
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
