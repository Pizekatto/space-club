import { Injectable } from '@angular/core'
import festivals from './festivals.json'
import { Festival } from './interfaces'

@Injectable()
export class FestivalsService {
  festivalss: Festival[]
  constructor() {
    this.festivalss = festivals.map(el => ({
      ...el,
      coordinates: el.coordinates as [number, number][],
      date:
        el.date?.map(el => ({
          start: new Date(el.start),
          end: new Date(el.end)
        })) || null
    }))
  }
  getData(): Festival[] {
    console.log(this.festivalss)
    return this.festivalss
  }
}
