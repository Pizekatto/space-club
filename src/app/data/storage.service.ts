import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, map } from 'rxjs'
import { Festival } from './interfaces'
import { DataService } from './data.service'
import { FestivalsService } from './festivals.service'

const STORAGE_KEY = 'festivals'

@Injectable()
export class StorageService {
  protected readonly state$!: BehaviorSubject<Festival[]>
  readonly storage: Storage = window.localStorage

  constructor(private festService: FestivalsService) {
    this.state$ = new BehaviorSubject<Festival[]>(this.getLocalState())
  }

  get(): BehaviorSubject<Festival[]> {
    return this.state$
  }

  set(state: Festival[]) {
    this.setState(state)
  }

  clear() {
    this.storage.clear()
  }

  reset(): void {
    this.setState(this.festService.getFestivals())
  }

  addItem(state: Festival) {
    this.setState([...this.state$.getValue(), state])
  }

  protected setState(state: Festival[]) {
    this.state$.next(state)
    this.setLocalState(state)
  }

  protected setLocalState(state: Festival[]) {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  protected getLocalState(): Festival[] {
    const localState = this.storage.getItem(STORAGE_KEY)
    return localState ? JSON.parse(localState) : this.festService.getFestivals()
  }
}
