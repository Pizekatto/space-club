import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable, Injector, inject } from '@angular/core'
import { ACCESS_TOKENS, URLS } from '@app/app.module'
import { Coordinates, GeoCodingResult } from '@app/data/interfaces'
import { BehaviorSubject, Observable, Subject, map, tap } from 'rxjs'

export enum Locations {
  russia = 'russia',
  europe = 'europe',
  asia = 'asia',
  america = 'america'
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  accessToken: string
  geocoding_url: string
  constructor(private http: HttpClient, private injector: Injector) {
    this.accessToken = this.injector.get(ACCESS_TOKENS).mapbox
    this.geocoding_url = inject(URLS).mapbox
  }
  allFestivalCoordinates!: Coordinates

  geoCodingGetAddress(request: string | [number, number]): Observable<GeoCodingResult[]> {
    let reverse = false
    if (Array.isArray(request)) {
      reverse = true
      request = request.join(',')
    } else {
      request = encodeURIComponent(request)
    }
    const base = this.geocoding_url
    const url = new URL(request + '.json', base)
    let params = new HttpParams()
    if (!reverse) {
      params = params.set('limit', (5).toString())
    }
    params = params.set('access_token', this.accessToken)

    return this.http.get<any>(url.toString(), { params }).pipe(
      map(data => {
        return data.features.map((item: any) => ({
          place: item.place_name,
          point: item.geometry
        }))
      })
    )
  }
}
