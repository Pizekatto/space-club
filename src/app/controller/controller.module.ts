import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

import { LayoutModule as MaterialLayout } from '@angular/cdk/layout'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { MatPaginatorModule } from '@angular/material/paginator'
import { TableComponent } from './table/table.component'
import { TableTestComponent } from './table/table-test.component'
import { MatSortModule } from '@angular/material/sort'
import { MatInputModule } from '@angular/material/input'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core'
import { MatChipsModule } from '@angular/material/chips'
import { MatAutocompleteModule } from '@angular/material/autocomplete'

import { ControllerComponent } from './controller.component'
import { DataTableComponent } from './table/data-table.component'
import { MapModule } from '@app/map/map.module'

@NgModule({
  declarations: [ControllerComponent, TableComponent, TableTestComponent, DataTableComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MapModule,

    MaterialLayout,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    }
  ]
})
export class ControllerModule {}
