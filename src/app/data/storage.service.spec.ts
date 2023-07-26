import { TestBed } from '@angular/core/testing'

import { StorageService } from './storage.service'
import { FestivalsService } from './festivals.service'
import { FESTIVALS_STUB } from './festivals.stub'

describe('service: StorageService', () => {
  let service: StorageService
  let festServiceSpy: jasmine.SpyObj<FestivalsService>

  beforeEach(() => {
    const spy = jasmine.createSpyObj(['get', 'deserializeDate'])
    TestBed.configureTestingModule({
      providers: [
        StorageService,
        {
          provide: FestivalsService,
          useValue: spy
        }
      ]
    })
    service = TestBed.inject(StorageService)
    festServiceSpy = TestBed.inject(FestivalsService) as jasmine.SpyObj<FestivalsService>
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
