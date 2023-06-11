import { Injectable } from '@angular/core'
import { Festival, PeriodicElement } from './interfaces'
import { Coordinates } from '@app/data/interfaces'

import data from './data.json'
import { FestivalsService } from './festivals.service'

@Injectable()
export class DataService {
  ELEMENT_DATA: PeriodicElement[] = [...data]
  allFestivalsCoordinates: Coordinates // [lng, lat]

  constructor(private festService: FestivalsService) {
    this.allFestivalsCoordinates = this.getAllFestivalsCoordinates()
  }

  /** фестивали с координатами [lng, lat] */
  getFestivals() {
    return this.festService.getData().map(el => {
      const festival: Festival = structuredClone(el)
      festival.coordinates.forEach(el => el.reverse())
      return festival
    })
  }

  /** Координаты всех фестивалей [lng, lat] */
  getAllFestivalsCoordinates(): Coordinates {
    return this.getFestivals()
      .map(el => el.coordinates)
      .flat()
  }

  getrandomElement(): PeriodicElement {
    const randomElementIndex = Math.floor(Math.random() * this.ELEMENT_DATA.length)
    return this.ELEMENT_DATA[randomElementIndex]
  }
}
