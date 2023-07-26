import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ControllerComponent } from './controller.component'
import { Component } from '@angular/core'
import { RouterTestingModule } from '@angular/router/testing'

@Component({ selector: 'app-data-table', template: '' })
class TableStubComponent {}
@Component({ selector: 'app-map', template: '' })
class MapStubComponent {}

// describe('ControllerComponent', () => {
//   let fixture: ComponentFixture<ControllerComponent>

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       declarations: [ControllerComponent, TableStubComponent, MapStubComponent]
//     })
//     fixture = TestBed.createComponent(ControllerComponent)
//   })

//   it('should create the app', () => {
//     const app = fixture.componentInstance
//     expect(app).toBeTruthy()
//   })
// })
