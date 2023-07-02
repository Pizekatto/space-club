import { ModuleWithProviders, NgModule } from '@angular/core'
import { DataService } from './data.service'
import { FestivalsService } from './festivals.service'
import { IconService } from './icon.service'

@NgModule({})
export class DataModule {
  static forRoot(): ModuleWithProviders<DataModule> {
    return {
      ngModule: DataModule,
      providers: [DataService, FestivalsService, IconService]
    }
  }
}
