import { Injectable } from '@angular/core'
import { FestDate, Festival } from './interfaces'

import { Locations, MapService } from '@app/map/map.service'
import { StorageService } from './storage.service'

import { Observable, of, tap } from 'rxjs'
import { FestivalsService } from './festivals.service'

@Injectable({
  providedIn: 'root'
})
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

  constructor(
    private storageService: StorageService,
    private festService: FestivalsService,
    private mapService: MapService
  ) {}

  getData(): Observable<Festival[]> {
    const localState = this.storageService.get()
    const state = localState ? of(localState) : this.festService.get()
    return state.pipe(
      tap(data => {
        this.mapService.allFestivalCoordinates = this.festService.getAllFestivalsCoordinates(data)
      })
    )
  }

  setData(data: Festival[]) {
    this.storageService.set(data)
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
