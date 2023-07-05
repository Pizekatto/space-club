import { ModuleWithProviders, NgModule } from '@angular/core'
import { DataService } from './data.service'
import { FestivalsService } from './festivals.service'
import { IconService } from './icon.service'
import { StorageService } from './storage.service'
import { SupabaseService } from './supabase.service'

@NgModule({})
export class DataModule {
  static forRoot(): ModuleWithProviders<DataModule> {
    return {
      ngModule: DataModule,
      providers: [DataService, FestivalsService, IconService, StorageService, SupabaseService]
    }
  }
}
