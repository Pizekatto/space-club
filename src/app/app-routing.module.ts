import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ControllerComponent } from './controller/controller.component'

const routes: Routes = [
  {
    path: '',
    component: ControllerComponent
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
