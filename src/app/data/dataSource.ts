import { Festival } from './interfaces'
import { DataService } from './data.service'
import { MatTableDataSource } from '@angular/material/table'

export class DataTableDataSource extends MatTableDataSource<Festival> {
  constructor(initialData: Festival[], private dataService: DataService) {
    super(initialData)
  }

  setData(data: Festival[]) {
    this.data = data
    this.dataService.setData(data)
  }
}
