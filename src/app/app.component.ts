import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component } from '@angular/core'
import { ResolveEnd, Router } from '@angular/router'
import { delay } from 'rxjs'

@Component({
  selector: 'space-club',
  animations: [trigger('preloader', [transition(':leave', animate(1500, style({ opacity: 0 })))])],
  template: ` <div *ngIf="loading" [@preloader] class="preloader">
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
    </div>
    <router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  loading = true
  constructor(private router: Router) {
    this.router.events.pipe(delay(1000)).subscribe(event => {
      if (event instanceof ResolveEnd) {
        this.loading = false
      }
    })
  }
}
