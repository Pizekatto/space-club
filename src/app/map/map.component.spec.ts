import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Component } from '@angular/core'
import { MapComponent } from './map.component'
import { BreakpointObserver } from '@angular/cdk/layout'
import { MapService } from './map.service'
import { ACCESS_TOKENS } from '@app/app.module'
import { environment } from 'src/environments/environments'

describe('component: MapComponent', () => {
  let fixture: ComponentFixture<MapComponent>
  let mapServiceSpy: jasmine.SpyObj<MapService>

  beforeEach(() => {
    const spy = jasmine.createSpyObj('', [], {
      allFestivalCoordinates: [
        [-108.75608312798761, 42.62375355009837],
        [-108.75654, 42.623348]
      ]
    })
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      providers: [
        BreakpointObserver,
        {
          provide: MapService,
          useValue: spy
        },
        {
          provide: ACCESS_TOKENS,
          useValue: {
            supabase: environment.supabase.accessToken,
            mapbox: environment.mapboxgl.accessToken
          }
        }
      ]
    })
    fixture = TestBed.createComponent(MapComponent)
    mapServiceSpy = fixture.debugElement.injector.get(MapService) as jasmine.SpyObj<MapService>
  })

  it('should create the app', () => {
    const app = fixture.componentInstance
    expect(app).toBeTruthy()
  })
})
