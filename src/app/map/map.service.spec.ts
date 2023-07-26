import { TestBed } from '@angular/core/testing'

import { MapService } from './map.service'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { ACCESS_TOKENS, URLS } from '@app/app.module'
import { environment } from 'src/environments/environments'
import {
  GEOCODING_RESULT_DTO_STUB,
  GEOCODING_RESULT_STUB,
  REVERSE_GEOCODING_RESULT_DTO_STUB,
  REVERSE_GEOCODING_RESULT_STUB
} from '@app/data/geocodingResult.stub'
import { HttpErrorResponse } from '@angular/common/http'

describe('service: MapService', () => {
  let service: MapService
  let backend: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MapService,
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
        }
      ]
    })
    service = TestBed.inject(MapService)
    backend = TestBed.inject(HttpTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('должен вернуть координаты в ответ на воод адреса (выполнить геокодирование)', () => {
    const request = 'Краснодар'
    service.geoCodingGetAddress(request).subscribe(result => {
      expect(result).toEqual(GEOCODING_RESULT_STUB)
    })

    const testRequest = backend.expectOne(
      'https://api.mapbox.com/geocoding/v5/mapbox.places/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B4%D0%B0%D1%80.json?limit=5&access_token=pk.eyJ1IjoicGl6ZWthdHRvIiwiYSI6ImNqZmtvZ2JwZTA5d3MzMnJxY3ZuMDNsZWIifQ.pv1NlRlPlLascI6fJ78T2g',
      'геокодирование'
    )
    expect(testRequest.cancelled).toBeFalsy()
    expect(testRequest.request.responseType).toBe('json')
    testRequest.flush(GEOCODING_RESULT_DTO_STUB)
  })

  it('должен вернуть адрес в ответ на воод координат (выполнить обратное геокодирование)', () => {
    const request = [-108.75608312798761, 42.62375355009837] as [number, number]
    service.geoCodingGetAddress(request).subscribe(result => {
      expect(result).toEqual(REVERSE_GEOCODING_RESULT_STUB)
    })
    backend
      .expectOne(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/-108.75608312798761,42.62375355009837.json?access_token=pk.eyJ1IjoicGl6ZWthdHRvIiwiYSI6ImNqZmtvZ2JwZTA5d3MzMnJxY3ZuMDNsZWIifQ.pv1NlRlPlLascI6fJ78T2g'
      )
      .flush(REVERSE_GEOCODING_RESULT_DTO_STUB)
  })

  it('должен выдать ошибку при неудачном запросе', () => {
    const request = 'Краснодар'
    service.geoCodingGetAddress(request).subscribe(
      () => fail('Запрос потерпел неудачу'),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500)
      }
    )

    const testRequest = backend.expectOne(
      'https://api.mapbox.com/geocoding/v5/mapbox.places/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B4%D0%B0%D1%80.json?limit=5&access_token=pk.eyJ1IjoicGl6ZWthdHRvIiwiYSI6ImNqZmtvZ2JwZTA5d3MzMnJxY3ZuMDNsZWIifQ.pv1NlRlPlLascI6fJ78T2g'
    )
    testRequest.flush('Ошибочный запрос', {
      status: 500,
      statusText: 'Internal server error'
    })
  })

  afterEach(() => backend.verify())
})
