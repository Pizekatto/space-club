import { NgModule, inject } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ControllerComponent } from './controller/controller.component'
import { DataService } from './data/data.service'

const routes: Routes = [
  {
    path: '',
    component: ControllerComponent,
    resolve: {
      data: () => inject(DataService).getData()
    }
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
