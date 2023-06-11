import { Component, ViewChild, ViewEncapsulation } from '@angular/core'
import { DataService } from 'src/app/data/data.service'
import { PeriodicElement } from '@app/data/interfaces'
import { MatTable, MatTableDataSource } from '@angular/material/table'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { SelectionModel } from '@angular/cdk/collections'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent {
  dataSource: MatTableDataSource<PeriodicElement>
  displayedColumns: string[] = ['select', 'position', 'name', 'weight', 'symbol']
  allowMultiSelect = true
  initialSelection = []
  selection: SelectionModel<PeriodicElement>

  @ViewChild(MatTable) table!: MatTable<PeriodicElement>
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
    this.dataSource.filter
  }

  constructor(public dataService: DataService) {
    this.dataSource = new MatTableDataSource<PeriodicElement>(this.dataService.ELEMENT_DATA)
    this.selection = new SelectionModel<PeriodicElement>(this.allowMultiSelect, this.initialSelection)
  }

  addData() {
    this.dataSource.data = [...this.dataSource.data, this.dataService.getrandomElement()]
  }

  removeData() {
    this.dataSource.data = this.dataSource.data.slice(0, -1)
  }

  clearTable() {
    this.dataSource.data = []
  }

  fillTable() {
    this.dataSource.data = this.dataService.ELEMENT_DATA
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage()
    }
  }

  /** все ли элементы выбраны */
  isAllSelected() {
    console.log('проверка isAllSelected')
    return this.selection.selected.length == this.dataSource.data.length
  }

  /**
   * Выбирает все строки, если они не все выбраны; в противном случае очищает выбор
   */
  toggleAllRows() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row))
  }

  getTotalCount() {
    return this.dataSource.data.length
  }

  log(event: PageEvent) {
    console.log(event)
  }
}
