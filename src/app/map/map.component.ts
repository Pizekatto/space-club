import { Component, EventEmitter, Inject, Injector, Input, OnChanges } from '@angular/core'
import { ACCESS_TOKENS } from '@app/app.module'
import { DataService } from '@app/data/data.service'
import { AccessTokens, Coordinates, Festival } from '@app/data/interfaces'
import mapboxgl from 'mapbox-gl'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  host: {
    id: 'map'
  }
})
export class MapComponent {
  startingСenter: [number, number]
  mapbox: any
  mapLoaded: boolean = false
  onMapLoaded = new EventEmitter<boolean>()

  constructor(
    private dataService: DataService,
    @Inject(ACCESS_TOKENS) private accessTokens: AccessTokens,
    private injector: Injector
  ) {
    this.startingСenter = this.dataService.allFestivalsCoordinates[0]
  }

  async ngOnInit() {
    mapboxgl.accessToken = this.injector.get(ACCESS_TOKENS).mapbox
    // mapboxgl.accessToken = this.accessTokens.mapbox
    this.mapbox = await this.createMap()
    this.onMapLoaded.emit(true)
    this.mapLoaded = true
    this.configureMap()
    this.addFestivalsPoints()
  }

  addFestivalsPoints() {
    this.mapbox.addSource('points', this.createGeoJson(this.dataService.allFestivalsCoordinates))

    this.mapbox.addLayer({
      id: 'circle',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-color': '#4264fb',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })
  }

  createGeoJson(coordinates: Coordinates) {
    const features = coordinates.map(el => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: el
      }
    }))

    return {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    }
  }

  async selectPoint(point: Coordinates) {
    if (!this.mapLoaded) return
    this.mapbox.flyTo({
      center: point[0]
    })
  }

  async createMap() {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.startingСenter,
      zoom: 3
    })
    await new Promise(resolve => {
      map.on('load', () => resolve('Карта загружена'))
    })
    return map
  }

  async configureMap() {
    this.mapbox.on('mouseenter', 'circle', () => {
      this.mapbox.getCanvas().style.cursor = 'pointer'
    })
    this.mapbox.on('mouseleave', 'circle', () => {
      this.mapbox.getCanvas().style.cursor = ''
    })
    this.mapbox.on('click', 'circle', (event: any) => {
      this.mapbox.flyTo({
        center: event.lngLat
      })
    })
  }
}
