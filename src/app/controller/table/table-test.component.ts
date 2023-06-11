import { Component, ViewEncapsulation } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { DataService } from '@app/data/data.service'
import { PeriodicElement } from '@app/data/interfaces'
import { animate, state, style, transition, trigger } from '@angular/animations'

@Component({
  selector: 'app-table-test',
  templateUrl: './table-test.component.html',
  styles: [
    `
      table {
        width: 100%;
      }

      tr.example-detail-row {
        height: 0;
      }

      tr.example-element-row:not(.example-expanded-row):hover {
        background: whitesmoke;
      }

      tr.example-element-row:not(.example-expanded-row):active {
        background: #efefef;
      }

      .example-element-row td {
        border-bottom-width: 0;
      }

      .example-element-detail {
        overflow: hidden;
        display: flex;
      }

      .example-element-diagram {
        min-width: 80px;
        border: 2px solid black;
        padding: 8px;
        font-weight: lighter;
        margin: 8px 0;
        height: 104px;
      }

      .example-element-symbol {
        font-weight: bold;
        font-size: 40px;
        line-height: normal;
      }

      .example-element-description {
        padding: 16px;
      }

      .example-element-description-attribution {
        opacity: 0.5;
      }
    `
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
  // encapsulation: ViewEncapsulation.None
})
export class TableTestComponent {
  dataSource: MatTableDataSource<PeriodicElement>
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol']
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand']
  expandedElement?: PeriodicElement
  some: string = 'Hello'
  one = 'one'

  constructor(public dataService: DataService) {
    this.dataSource = new MatTableDataSource<PeriodicElement>(this.dataService.ELEMENT_DATA)
  }
}
