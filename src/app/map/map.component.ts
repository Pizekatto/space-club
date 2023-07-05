import { Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ACCESS_TOKENS } from '@app/app.module'
import { Coordinates, Festival } from '@app/data/interfaces'
import mapboxgl from 'mapbox-gl'
import { Observable, Subject } from 'rxjs'
import { MapService } from './map.service'

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  host: {
    id: 'map'
  }
})
export class MapComponent {
  startingСenter!: [number, number]
  mapbox: any
  mapLoaded: boolean = false
  allPointsCoordinates: [number, number][]
  @Output() onMapLoaded = new EventEmitter<boolean>()
  @Output() onPointCreated = new EventEmitter<[number, number]>()

  constructor(private routes: ActivatedRoute, private mapService: MapService) {
    this.allPointsCoordinates = this.mapService.allFestivalCoordinates
    this.startingСenter = this.allPointsCoordinates[0]
    mapboxgl.accessToken = inject(ACCESS_TOKENS).mapbox
  }

  async ngOnInit() {
    this.mapbox = await this.createMap()
    this.onMapLoaded.emit(true)
    this.mapLoaded = true
    this.configureMap()
    this.addFestivalsPoints()
  }

  addFestivalsPoints() {
    this.mapbox.addSource('points', {
      type: 'geojson',
      data: this.createGeoJson(this.allPointsCoordinates)
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
    this.refreshPoints()
    this.mapbox.flyTo({
      center: coordinates,
      zoom: this.mapbox.getStyle().zoom + 3
    })
    // this.onPointCreated.emit(coordinates)
  }

  removeLastPoint() {
    this.allPointsCoordinates.shift()
    this.refreshPoints()
    this.mapbox.zoomTo(3)
  }

  refreshPoints() {
    const geojson = this.createGeoJson(this.allPointsCoordinates)
    const geojsonSource = this.mapbox.getSource('points')
    geojsonSource.setData(geojson)
  }

  removePoint(i: number) {
    this.allPointsCoordinates = this.allPointsCoordinates.filter((_, index) => index != i)
    this.refreshPoints()
  }

  afterSave() {
    this.mapbox.zoomTo(3)
  }
}
