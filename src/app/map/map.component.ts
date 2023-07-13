import { Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ACCESS_TOKENS } from '@app/app.module'
import { Coordinates, Festival } from '@app/data/interfaces'
import mapboxgl from 'mapbox-gl'
import { Observable, Subject } from 'rxjs'
import { MapService } from './map.service'
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout'

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
  mobileView = false
  mobileZoom = 1.5
  bigZoom = 3
  zoom = this.bigZoom
  selectPointListener?: (event: any) => void

  constructor(private routes: ActivatedRoute, private mapService: MapService, breakpointObserver: BreakpointObserver) {
    this.allPointsCoordinates = this.mapService.allFestivalCoordinates
    this.startingСenter = this.allPointsCoordinates[0]
    mapboxgl.accessToken = inject(ACCESS_TOKENS).mapbox

    breakpointObserver.observe('(max-height: 700px)').subscribe((breakpoints: BreakpointState) => {
      if (breakpoints.matches) {
        this.mobileView = true
        this.zoom = this.mobileZoom
        this.mapbox?.zoomTo(this.zoom)
      } else {
        this.mobileView = false
        this.zoom = this.bigZoom
        this.mapbox?.zoomTo(this.zoom)
      }
    })
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
      zoom: this.zoom
    })
  }

  addPointMode = (dataStream: Subject<[number, number]>) => {
    const canvas = this.mapbox.getCanvasContainer()
    canvas.style.cursor = 'crosshair'
    this.selectPointListener = (event: any) => {
      const coordinates: [number, number] = [event.lngLat.lng, event.lngLat.lat]
      this.createPoint(coordinates)
      dataStream.next(coordinates)
      dataStream.complete()
      canvas.style.cursor = ''
    }
    this.mapbox.once('click', this.selectPointListener)
  }

  cancelAddPointMode() {
    const canvas = this.mapbox.getCanvasContainer()
    this.mapbox.off('click', this.selectPointListener)
    canvas.style.cursor = ''
  }

  async createMap() {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.startingСenter,
      zoom: this.zoom,
      antialias: false
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
    this.mapbox.zoomTo(this.zoom)
  }

  removePoint(i: number) {
    this.allPointsCoordinates = this.allPointsCoordinates.filter((_, index) => index != i)
    this.refreshPoints()
  }

  refreshPoints() {
    const geojson = this.createGeoJson(this.allPointsCoordinates)
    const geojsonSource = this.mapbox.getSource('points')
    geojsonSource.setData(geojson)
  }

  afterSave() {
    this.mapbox.zoomTo(this.zoom)
  }
}
