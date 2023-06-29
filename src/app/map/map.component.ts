import { Component, EventEmitter, Inject, Injector, Input, OnChanges, Output } from '@angular/core'
import { ACCESS_TOKENS } from '@app/app.module'
import { DataService } from '@app/data/data.service'
import { AccessTokens, Coordinates, Festival } from '@app/data/interfaces'
import mapboxgl from 'mapbox-gl'
import { Subject } from 'rxjs'

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
  allPointsCoordinates: [number, number][]
  @Output() onMapLoaded = new EventEmitter<boolean>()
  @Output() onPointCreated = new EventEmitter<[number, number]>()

  constructor(
    private dataService: DataService,
    @Inject(ACCESS_TOKENS) private accessTokens: AccessTokens,
    private injector: Injector
  ) {
    this.startingСenter = this.dataService.allFestivalsCoordinates[0]
    this.allPointsCoordinates = this.dataService.allFestivalsCoordinates
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
    this.mapbox.addSource('points', {
      type: 'geojson',
      data: this.createGeoJson(this.dataService.allFestivalsCoordinates)
    })

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

  createGeoJson = (coordinates: Coordinates) => {
    const features = coordinates.map(el => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: el
      }
    }))
    const geoJson = {
      type: 'FeatureCollection',
      features
    }
    return geoJson
  }

  selectPoint(point: Coordinates) {
    if (!this.mapLoaded) return
    this.mapbox.flyTo({
      center: point[0],
      zoom: 3
    })
  }

  addPointMode = (dataStream: Subject<[number, number]>) => {
    const canvas = this.mapbox.getCanvasContainer()
    canvas.style.cursor = 'crosshair'
    this.mapbox.once('click', (event: any) => {
      // event.preventDefault()
      const coordinates: [number, number] = [event.lngLat.lng, event.lngLat.lat]
      this.createPoint(coordinates)
      dataStream.next(coordinates)
      dataStream.complete()
      canvas.style.cursor = ''
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

  configureMap = async () => {
    this.mapbox.on('mouseenter', 'circle', () => {
      this.mapbox.getCanvas().style.cursor = 'pointer'
    })
    this.mapbox.on('mouseleave', 'circle', () => {
      this.mapbox.getCanvas().style.cursor = ''
    })
  }

  createPoint = (coordinates: [number, number]) => {
    this.allPointsCoordinates.unshift(coordinates)
    const geojsonSource = this.mapbox.getSource('points')
    const geojson = this.createGeoJson(this.allPointsCoordinates)
    geojsonSource.setData(geojson)
    this.mapbox.flyTo({
      center: coordinates,
      zoom: this.mapbox.getStyle().zoom + 3
    })
    // this.onPointCreated.emit(coordinates)
  }

  removeLastPoint() {
    this.allPointsCoordinates.pop()
    this.refreshPoints()
    this.mapbox.zoomTo(3)
  }

  refreshPoints() {
    const geojson = this.createGeoJson(this.allPointsCoordinates)
    const geojsonSource = this.mapbox.getSource('points')
    geojsonSource.setData(geojson)
  }

  removePoint(i: number) {
    console.log([...this.allPointsCoordinates])
    console.log(this.allPointsCoordinates[i])
    this.allPointsCoordinates = this.allPointsCoordinates.filter((_, index) => index != i)
    this.refreshPoints()
  }

  afterSave() {
    this.mapbox.zoomTo(3)
  }
}
