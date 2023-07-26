import { TestBed } from '@angular/core/testing'

import { DataService } from './data.service'
import { StorageService } from './storage.service'
import { FestivalsService } from './festivals.service'
import { MapService } from '@app/map/map.service'

describe('service: DataService', () => {
  let service: DataService
  let storageServiceSpy: jasmine.SpyObj<StorageService>
  let festivalServiceSpy: jasmine.SpyObj<FestivalsService>
  let mapServiceSpy: jasmine.SpyObj<MapService>

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('MockStorageService', ['set'])
    const festivalSpy = jasmine.createSpyObj('MockFestivalsService', ['get', 'getAllFestivalsCoordinates'])
    const mapSpy = jasmine.createSpyObj('MockMapService', [], ['allFestivalCoordinates'])

    TestBed.configureTestingModule({
      providers: [
        DataService,
        {
          provide: StorageService,
          useValue: storageSpy
        },
        {
          provide: FestivalsService,
          useValue: festivalSpy
        },
        {
          provide: MapService,
          useValue: mapSpy
        }
      ]
    })
    service = TestBed.inject(DataService)
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>
    festivalServiceSpy = TestBed.inject(FestivalsService) as jasmine.SpyObj<FestivalsService>
    mapServiceSpy = TestBed.inject(MapService) as jasmine.SpyObj<MapService>
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
