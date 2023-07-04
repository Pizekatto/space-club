import { Injectable } from '@angular/core'
import { FestDate, Festival } from './interfaces'
import { Coordinates } from '@app/data/interfaces'

import { FestivalsService } from './festivals.service'
import { Locations } from '@app/map/map.service'
import { StorageService } from './storage.service'

import { BehaviorSubject, Observable, Subject, delay, map } from 'rxjs'

@Injectable()
export class DataService {
  filterFunctions: Record<string, (f: Festival, dateRange: Partial<FestDate>) => boolean | void> = {
    date: this.dateFilter,
    range: this.rangeFilter,
    [Locations.russia]: this.russiaFilter,
    [Locations.europe]: this.europeFilter,
    [Locations.asia]: this.asiaFilter,
    [Locations.america]: this.americaFilter,
    passed: this.passedFilter,
    notPassed: this.notPassedFilter
  }

  constructor(private storageService: StorageService) {}

  getData(): BehaviorSubject<Festival[]> {
    return this.storageService.get()
  }

  setData(data: Festival[]) {
    this.storageService.set(data)
  }

  /** Координаты всех фестивалей [lng, lat] */
  getAllFestivalsCoordinatesStream(): Observable<Coordinates> {
    return this.getData().pipe(
      delay(0),
      map(data => {
        return data.map(el => el.coordinates).flat()
      })
    )
  }

  dateFilter(festival: Festival) {
    if (!festival.date) return
    return true
  }

  rangeFilter(festival: Festival, dateRange: Partial<FestDate>) {
    if (!dateRange.start && !dateRange.end) return true
    if (!festival.date) return false
    if (!festival.date[0].start || !dateRange.start) return false
    const festStart = festival.date[0].start
    const festEnd = festival.date[festival.date.length - 1].end
    const dateRangeEnd = dateRange.end && new Date(dateRange.end.setHours(3))
    const dateRangeStart = new Date(dateRange.start.setHours(3))

    return Boolean(
      (festStart >= dateRangeStart && dateRangeEnd && festStart <= dateRangeEnd) ||
        (festEnd && dateRangeEnd && festEnd >= dateRangeStart && festEnd <= dateRangeEnd)
    )
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
  passedFilter(festival: Festival) {
    if (!festival.date) return
    if (!festival.date[0].start) return
    if (festival.date[0].start < new Date()) return true
    return
  }
  notPassedFilter(festival: Festival) {
    if (!festival.date) return
    if (!festival.date[0].start) return
    if (festival.date[0].start > new Date()) return true
    return
  }
}
