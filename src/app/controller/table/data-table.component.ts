import { SelectionModel } from '@angular/cdk/collections'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { DataService } from '@app/data/data.service'
import { Festival } from '@app/data/interfaces'

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  dataSource: MatTableDataSource<Festival>
  displayedColumns: Array<keyof Festival> = ['title']
  titles: Record<keyof Festival, string> = {
    title: 'Фестиваль',
    website: 'Сайт',
    coordinates: 'Координаты'
  }
  initialSelection = []
  allowMultiSelect = false
  selection: SelectionModel<Festival>

  @Input() mapIsReady = false
  @Output() onSelectionChange = new EventEmitter<Festival>()

  constructor(private dataService: DataService) {
    this.dataSource = new MatTableDataSource<Festival>(this.dataService.getFestivals())
    this.selection = new SelectionModel<Festival>(this.allowMultiSelect, this.initialSelection)
    this.selection.changed.subscribe(() => {
      this.onSelectionChange.emit(this.selection.selected[0])
    })
  }

  selectRow(row: Festival) {
    this.selection.select(row)
    this.onSelectionChange.emit(this.selection.selected[0])
  }
}
