import { NgModule } from '@angular/core'
import { MapComponent } from './map.component'
import { MapService } from './map.service'
import { HttpClientModule } from '@angular/common/http'

@NgModule({
  declarations: [MapComponent],
  imports: [HttpClientModule],
  providers: [MapService],
  exports: [MapComponent]
})
export class MapModule {}
