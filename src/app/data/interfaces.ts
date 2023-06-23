import { FormControl, FormGroup } from '@angular/forms'

export interface PeriodicElement {
  name: string
  position: number
  weight: number
  symbol: string
  description: string
}

interface FestDate {
  start: Date | null
  end: Date | null
}

export interface Festival {
  title: string
  website?: string
  coordinates: [number, number][]
  place?: string
  date?: FestDate[] | null
}

export interface CreateUpdateForm
  extends FormGroup<{
    title: FormControl<string | null>
    place: FormControl<string | null>
    date: FormGroup<{
      start: FormControl<Date | null>
      end: FormControl<Date | null>
    }>
    coordinates: FormControl<Coordinates | null>
  }> {}

export type Coordinates = Festival['coordinates']

export interface AccessTokens {
  mapbox: string
}

export interface GeoCodingResult {
  place: string
  point: any
}
