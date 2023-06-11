import { Injectable } from '@angular/core'
import festivals from './festivals.json'
import { Festival } from './interfaces'

console.log('в точке импорта JSON', festivals[0].coordinates)

@Injectable()
export class FestivalsService {
  getData(): Festival[] {
    return festivals as Festival[]
  }
}
