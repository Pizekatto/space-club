import { Component, ViewChild } from '@angular/core'
import { Subject } from 'rxjs'
import { Festival } from '@app/data/interfaces'
import { DataTableComponent } from './table/data-table.component'
import { MapComponent } from '@app/map/map.component'

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent {
  mapIsReady: boolean = false

  @ViewChild(DataTableComponent) dataTable!: DataTableComponent
  @ViewChild(MapComponent) map!: MapComponent

  constructor() {}

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

  cancelSelectMapMode() {
    this.map.cancelAddPointMode()
  }

  removePoint(i: number) {
    this.map.removePoint(i)
  }

  afterSaveFestival() {
    this.map.afterSave()
  }
}
