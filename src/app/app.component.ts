import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Control Acceso USCO';
  isAnyViewUpdate?: boolean;

  constructor(private update: SwUpdate) {
    this.update
      .checkForUpdate()
      .then((res) => (this.isAnyViewUpdate = res))
      .catch((err) =>
        console.log('there was an error checking for update:' + err)
      );
  }
}
