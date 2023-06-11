import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ControllerComponent } from './controller.component'
import { LayoutModule as MaterialLayout } from '@angular/cdk/layout'

import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { MatPaginatorModule } from '@angular/material/paginator'

import { TableComponent } from './table/table.component'
import { TableTestComponent } from './table/table-test.component'
import { MatSortModule } from '@angular/material/sort'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { DataTableComponent } from './table/data-table.component'
import { MapModule } from '@app/map/map.module'

@NgModule({
  declarations: [ControllerComponent, TableComponent, TableTestComponent, DataTableComponent],
  imports: [
    CommonModule,

    MapModule,

    MaterialLayout,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule
  ]
})
export class ControllerModule {}
