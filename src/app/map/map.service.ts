import { Injectable } from '@angular/core'
import { Coordinates } from '@app/data/interfaces'
import { Subject } from 'rxjs'

export enum Locations {
  russia = 'russia',
  europe = 'europe',
  asia = 'asia',
  america = 'america'
}

@Injectable()
export class MapService {
  $coordinates = new Subject<Coordinates>()

  setCoordinates(coordinates: Coordinates) {
    this.$coordinates.next(coordinates)
  }
}
