import { TestBed } from '@angular/core/testing'

import { FestivalsService } from './festivals.service'
import { SupabaseService } from './supabase.service'

describe('service: FestivalsService', () => {
  let service: FestivalsService
  let supabaseServiceSpy: jasmine.SpyObj<SupabaseService>

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MockSupabaseService', ['get'])

    TestBed.configureTestingModule({
      providers: [
        FestivalsService,
        {
          provide: SupabaseService,
          useValue: spy
        }
      ]
    })
    service = TestBed.inject(FestivalsService)
    supabaseServiceSpy = TestBed.inject(SupabaseService) as jasmine.SpyObj<SupabaseService>
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
