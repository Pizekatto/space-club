import { Injectable } from '@angular/core'
import { Coordinates } from '@app/data/interfaces'
import { Subject } from 'rxjs'

@Injectable()
export class MapService {
  public $coordinates = new Subject<Coordinates>()

  public setCoordinates(coordinates: Coordinates) {
    this.$coordinates.next(coordinates)
  }
}
