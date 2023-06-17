import { Injectable } from '@angular/core'
import { Festival, PeriodicElement } from './interfaces'
import { Coordinates } from '@app/data/interfaces'

import data from './data.json'
import { FestivalsService } from './festivals.service'
import { Locations } from '@app/map/map.service'

@Injectable()
export class DataService {
  ELEMENT_DATA: PeriodicElement[] = [...data]
  allFestivalsCoordinates: Coordinates // [lng, lat]
  filterFunctions: Record<string, (f: Festival) => boolean | void> = {
    date: this.dateFilter,
    [Locations.russia]: this.russiaFilter,
    [Locations.europe]: this.europeFilter,
    [Locations.asia]: this.asiaFilter,
    [Locations.america]: this.americaFilter,
    passed: this.passedFilter,
    notPassed: this.notPassedFilter
  }

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

  dateFilter(festival: Festival) {
    if (!festival.date) return false
    return true
  }

  russiaFilter() {
    return true
  }
  europeFilter() {
    return true
  }
  asiaFilter() {
    return true
  }
  americaFilter() {
    return true
  }
  passedFilter(festival: Festival): boolean | void {
    if (!festival.date) return
    if (new Date(festival.date[0].start) < new Date()) return true
  }
  notPassedFilter(festival: Festival): boolean | void {
    if (!festival.date) return
    if (new Date(festival.date[0].start) > new Date()) return true
  }
}
