import { Component, OnInit } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-tiquetes',
  templateUrl: './tiquetes.component.html',
  styleUrls: ['./tiquetes.component.css']
})
export class TiquetesComponent implements OnInit {

  resizeObservable!: Observable<Event>;
  resizeSubscription!: Subscription;

  mobile: boolean = false;

  constructor() { }

  ngOnInit() {
    if (window.screen.width <= 950) { // 768px portrait
      this.mobile = true;
    } else {
      this.mobile = false;
    }
    this.resizeObservable = fromEvent(window, 'resize');
    this.resizeSubscription = this.resizeObservable.subscribe(evt => {
      if (window.screen.width <= 950) { // 768px portrait
        this.mobile = true;
      } else {
        this.mobile = false;
      }
    });
  }

}
