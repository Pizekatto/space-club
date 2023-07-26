import { Festival, FestivalDTO } from './interfaces'

export const FESTIVALS_STUB: Festival[] = [
  {
    title: 'Burning Man',
    website: 'https://burningman.org/',
    coordinates: [[-119.20582957022538, 40.786245664621724]],
    date: [
      {
        start: new Date('2023-08-27'),
        end: new Date('2023-09-04')
      }
    ]
  },
  {
    title: 'Coachella',
    website: 'https://coachella.com/',
    coordinates: [[-116.23700430623643, 33.680436157996]],
    date: [
      {
        start: new Date('2023-04-14'),
        end: new Date('2023-04-16')
      },
      {
        start: new Date('2023-04-21'),
        end: new Date('2023-04-23')
      }
    ]
  }
]

export const FESTIVALS_STUB_DTO: FestivalDTO[] = [
  {
    title: 'Burning Man',
    website: 'https://burningman.org/',
    coordinates: [[40.786245664621724, -119.20582957022538]],
    date: [
      {
        start: '2023-08-27',
        end: '2023-09-04'
      }
    ]
  },
  {
    title: 'Coachella',
    website: 'https://coachella.com/',
    coordinates: [[33.680436157996, -116.23700430623643]],
    date: [
      {
        start: '2023-04-14',
        end: '2023-04-16'
      },
      {
        start: '2023-04-21',
        end: '2023-04-23'
      }
    ]
  }
]
