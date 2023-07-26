import { TestBed } from '@angular/core/testing'

import { SupabaseService } from './supabase.service'
import { environment } from 'src/environments/environments'
import { ACCESS_TOKENS, URLS, USERS } from '@app/app.module'

describe('service: SupabaseService', () => {
  let service: SupabaseService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SupabaseService,
        {
          provide: ACCESS_TOKENS,
          useValue: {
            supabase: environment.supabase.accessToken,
            mapbox: environment.mapboxgl.accessToken
          }
        },
        {
          provide: URLS,
          useValue: {
            mapbox: environment.mapboxgl.geocoding_url,
            supabase: environment.supabase.PUBLIC_URL
          }
        },
        {
          provide: USERS,
          useValue: {
            supabase: environment.supabase.user
          }
        }
      ]
    })
    service = TestBed.inject(SupabaseService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
