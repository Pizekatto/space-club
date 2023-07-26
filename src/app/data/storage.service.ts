import { Injectable } from '@angular/core'
import { Festival, FestivalDTO } from './interfaces'
import { FestivalsService } from './festivals.service'

const STORAGE_KEY = 'festivals'

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  readonly storage: Storage = window.localStorage

  constructor(private festService: FestivalsService) {}

  set(state: Festival[]) {
    this.setLocalState(state)
  }

  clear() {
    this.storage.clear()
  }

  reset(): void {
    this.festService.get().subscribe(data => this.setLocalState(data))
  }

  protected setLocalState(state: Festival[]) {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  get(): Festival[] | null {
    console.log('get вызван из настоящего класса')
    const localState = this.storage.getItem(STORAGE_KEY)
    return localState ? this.festService.deserializeDate(JSON.parse(localState) as FestivalDTO[]) : null
  }
}
