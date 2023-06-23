import { Injectable } from '@angular/core'
import festivals from './festivals.json'
import { Festival } from './interfaces'

@Injectable()
export class FestivalsService {
  festivalss: Festival[]
  exampleFest = {
    title: 'Фестиваль электронной музыки ',
    place: 'Краснодар',
    date: {
      start: new Date(2023, 6, 10),
      end: new Date(2023, 6, 15)
    }
  }

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
    return this.festivalss
  }

  saveData(festival: Festival) {
    console.log(festival)
  }
}
