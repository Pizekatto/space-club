import { NgModule } from '@angular/core'
import { MapComponent } from './map.component'
import { MapService } from './map.service'

@NgModule({
  declarations: [MapComponent],
  imports: [],
  providers: [MapService],
  exports: [MapComponent]
})
export class MapModule {}
