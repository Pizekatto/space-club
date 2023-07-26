import { NgModule, inject } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ControllerComponent } from './controller/controller.component'
import { DataService } from './data/data.service'
import { FESTIVALS_STUB } from './data/festivals.stub'
import { Observable, delay, of } from 'rxjs'

export const routes: Routes = [
  {
    path: '',
    component: ControllerComponent,
    pathMatch: 'full',
    resolve: {
      data: () => inject(DataService).getData()
    }
    // resolve: {
    //   data: () => of(FESTIVALS_STUB).pipe(delay(2000))
    // }
  },
  { path: '**', redirectTo: '' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
