import { FormControl, FormGroup } from '@angular/forms'

export interface FestDate {
  start: Date | null
  end: Date | null
}

export interface FestDateDTO {
  start: string
  end: string
}

export interface Festival {
  title: string
  website?: string
  coordinates: [number, number][]
  place?: string
  date?: FestDate[] | null
}

export interface FestivalDTO {
  title: string
  website?: string
  coordinates: [number, number][]
  place?: string
  date?: FestDateDTO[] | null
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

export interface DateRange
  extends FormGroup<{
    start: FormControl<Date | null>
    end: FormControl<Date | null>
  }> {}

export type Coordinates = Festival['coordinates']

export interface AccessTokens {
  mapbox: string
  supabase: string
}

export interface PublicUrls {
  mapbox: string
  supabase: string
}

export interface GeoCodingResult {
  place: string
  point: any
}
export interface Users {
  supabase: {
    email: string
    password: string
  }
}

export type TableColumns = keyof Festival
export type TableHeaderTitles = {
  [key in TableColumns]: string
}

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}
