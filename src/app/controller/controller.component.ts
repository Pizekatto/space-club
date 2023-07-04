import { Component, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core'
import { BreakpointObserver, Breakpoints, MediaMatcher, BreakpointState } from '@angular/cdk/layout'
import { Observable, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { DataService } from '../data/data.service'
import { MapService } from '@app/map/map.service'
import { Coordinates, Festival } from '@app/data/interfaces'
import { DataTableComponent } from './table/data-table.component'
import { MapComponent } from '@app/map/map.component'

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent {
  destroyed = new Subject<void>()
  currentScreenSize: string = Breakpoints.Small
  mapIsReady: boolean = false

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent
  @ViewChild(MapComponent) map!: MapComponent

  constructor(
    breakpointObserver: BreakpointObserver,
    mediaMatcher: MediaMatcher,
    public dataService: DataService,
    public mapService: MapService
  ) {
    breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, '(orientation: portrait)', '(orientation: landscape)'])
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => {
        const isSmallScreen = breakpointObserver.isMatched(Breakpoints.Small)
        this.currentScreenSize = isSmallScreen ? 'Small' : 'Unknown'
      })
  }

  selectFestival(festival: Festival) {
    this.map.selectPoint(festival.coordinates)
  }

  newPoint(coordinates: [number, number]) {
    this.map.createPoint(coordinates)
  }

  removeLastPoint() {
    this.map.removeLastPoint()
  }

  turnSelectMapMode(dataStream: Subject<[number, number]>) {
    this.map.addPointMode(dataStream)
  }

  removePoint(i: number) {
    this.map.removePoint(i)
  }

  afterSaveFestival() {
    this.map.afterSave()
  }
}
