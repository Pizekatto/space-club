import { Injectable } from '@angular/core'
import { Coordinates, Festival, FestivalDTO } from './interfaces'
import { SupabaseService } from './supabase.service'
import { Observable, map } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class FestivalsService {
  exampleFest = {
    title: 'Фестиваль электронной музыки ',
    place: 'Краснодар',
    date: {
      start: new Date(2023, 6, 10),
      end: new Date(2023, 6, 15)
    }
  }

  constructor(private supabase: SupabaseService) {}

  /** [lat, lng] -> [lng, lat] */
  swapCoordinates(festivals: FestivalDTO[]) {
    return festivals.map(festival => {
      festival.coordinates.forEach(el => el.reverse())
      return festival
    })
  }

  deserializeDate(festivals: FestivalDTO[]): Festival[] {
    return festivals.map(el => ({
      ...el,
      coordinates: el.coordinates as [number, number][],
      date:
        el.date?.map(el => ({
          start: new Date(el.start),
          end: new Date(el.end)
        })) || null
    }))
  }

  get(): Observable<Festival[]> {
    return this.supabase.get().pipe(map(this.swapCoordinates), map(this.deserializeDate))
  }

  /** Координаты всех фестивалей [lng, lat] */
  getAllFestivalsCoordinates(festivals: Festival[]): Coordinates {
    return festivals.map(festival => festival.coordinates).flat()
  }
}
