import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable, Injector } from '@angular/core'
import { ACCESS_TOKENS } from '@app/app.module'
import { Coordinates, GeoCodingResult } from '@app/data/interfaces'
import { Observable, Subject, map, tap } from 'rxjs'

export enum Locations {
  russia = 'russia',
  europe = 'europe',
  asia = 'asia',
  america = 'america'
}

@Injectable()
export class MapService {
  accessToken: any
  constructor(private http: HttpClient, private injector: Injector) {
    this.accessToken = this.injector.get(ACCESS_TOKENS).mapbox
  }
  $coordinates = new Subject<Coordinates>()

  setCoordinates(coordinates: Coordinates) {
    this.$coordinates.next(coordinates)
  }

  geoCodingGetAddress(request: string | [number, number]): Observable<GeoCodingResult[]> {
    let reverse = false
    if (Array.isArray(request)) {
      reverse = true
      request = request.join(',')
    } else {
      request = encodeURIComponent(request)
    }
    const base = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
    const url = new URL(request + '.json', base)
    let params = new HttpParams()
    if (!reverse) {
      params = params.set('limit', (5).toString())
    }
    params = params.set('access_token', this.accessToken)
    // console.log(url, params)

    return this.http.get<any>(url.toString(), { params }).pipe(
      map(data => {
        console.log(data)
        return data.features.map((item: any) => ({
          place: item.place_name,
          point: item.geometry
        }))
      })
    )
  }
}
