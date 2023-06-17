export interface PeriodicElement {
  name: string
  position: number
  weight: number
  symbol: string
  description: string
}

export interface Festival {
  title: string
  website?: string
  coordinates: [number, number][]
  place?: string
  date?:
    | {
        start: Date
        end: Date
      }[]
    | null
}

export type Coordinates = Festival['coordinates']

export interface AccessTokens {
  mapbox: string
}
