import { SelectionModel } from '@angular/cdk/collections'
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatTableDataSource } from '@angular/material/table'
import { DataService } from '@app/data/data.service'
import { FestivalsService } from '@app/data/festivals.service'
import { CHIPS } from '@app/data/filters'
import { Festival, CreateUpdateForm } from '@app/data/interfaces'
import { Locations, MapService } from '@app/map/map.service'
import { BehaviorSubject, Observable, Subject, debounceTime, map, startWith, switchMap, tap, filter } from 'rxjs'

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  dataSource: MatTableDataSource<Festival>
  displayedColumns: Array<keyof Festival> = ['title']

  titles: { [key in keyof Festival]: string } = {
    title: 'Фестивали',
    website: 'Сайт',
    coordinates: 'Координаты'
  }
  initialSelection = []
  allowMultiSelect = false
  selection: SelectionModel<Festival>
  dateSortRange: FormGroup
  createUpdateForm: CreateUpdateForm
  startDate? = ''
  endDate? = ''
  CHIPS = CHIPS
  selectedFilters = [...this.CHIPS.map(el => el.value)]
  _filters: Locations[] = []
  set filters(value: Locations[]) {
    this._filters = value
    this.filter(value.reduce<string>((acc, item) => acc + '.' + item, ''))
  }
  plus = true
  exampleFest = this.festService.exampleFest
  places: BehaviorSubject<any>
  placeSelected = false

  @Input() mapIsReady = false
  @Output() onSelectionChange = new EventEmitter<Festival>()
  @Output() onSelectNewPlace = new EventEmitter<[number, number]>()
  @Output() onTurnSelectMapMode = new EventEmitter<void>()
  @Output() onCancelLastSelect = new EventEmitter<void>()

  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private festService: FestivalsService,
    private mapService: MapService
  ) {
    this.dataSource = new MatTableDataSource<Festival>(this.dataService.getFestivals())
    this.selection = new SelectionModel<Festival>(this.allowMultiSelect, this.initialSelection)
    this.selection.changed.subscribe(() => {
      this.onSelectionChange.emit(this.selection.selected[0])
    })
    this.dataSource.filterPredicate = this.filterPredicate

    this.createUpdateForm = this.fb.group({
      title: this.exampleFest.title,
      place: this.exampleFest.place,
      date: this.fb.group(this.exampleFest.date)
    })
    this.dateSortRange = this.fb.group({
      start: null,
      end: null
    })
    this.dateSortRange.valueChanges.subscribe(v => {
      this.startDate = v.start
      this.endDate = v.end
    })
    this.dateSortRange.statusChanges.subscribe(v => console.log('status', v))
    this.places = new BehaviorSubject(1)

    this.createUpdateForm.controls['place'].valueChanges
      .pipe(
        debounceTime(2000),
        filter(_ => !this.placeSelected),
        filter(val => !!val),
        tap(v => console.log(v)),
        switchMap((request: any) => this.mapService.geoCodingGetAddress(request)),
        tap(console.log),
        tap(data => {
          this.places.next(data)
        })
      )
      .subscribe()
  }

  ngOnInit() {
    this.places.next([])
  }

  addData(row: Festival) {
    this.dataSource.data = [...this.dataSource.data, row]
  }
  removeData(row: Festival) {}
  add() {
    this.plus = true
    this.createUpdateForm.setValue(this.exampleFest)
  }
  cancel() {
    this.plus = false
    this.createUpdateForm.reset()
    this.placeSelected = false
  }

  selectRow(row: Festival) {
    this.selection.select(row)
    this.onSelectionChange.emit(this.selection.selected[0])
  }

  logging(v: any) {
    console.log(v)
  }

  filterPredicate = (data: Festival, filterString: string): boolean => {
    console.log('фильтр предикат', filterString)

    let currentFilters = filterString.split('.').slice(1)
    let result = false
    for (let i = 0; i < currentFilters.length; i++) {
      if (this.dataService.filterFunctions[currentFilters[i]](data)) {
        result = true
        break
      }
    }
    return result
  }

  filter(filter: string) {
    this.dataSource.filter = filter
  }

  /** нажатие на прицел */
  selectPoint(event: MouseEvent) {
    event.stopPropagation()
    this.createUpdateForm.controls['place'].reset()
    this.createUpdateForm.controls['place'].disable()
    this.onTurnSelectMapMode.emit()
  }

  saveFestival(formGroup: any) {
    console.log(formGroup)
    console.log(formGroup.value)
  }

  clearPlaceField() {
    this.createUpdateForm.controls['place'].reset()
    this.places.next([])
    if (this.placeSelected) {
      this.onCancelLastSelect.emit()
    }
    this.placeSelected = false
  }

  /** Выбор места из автокомплита */
  selectPlace(place: any) {
    console.log(place)
    this.placeSelected = true
    const coordinates = this.places.getValue()[Number(place.option.id)].point.coordinates
    console.log('вышли coordinates:', coordinates)

    this.onSelectNewPlace.emit(coordinates)
  }

  showPlacePoint(coordinates: [number, number]) {
    this.mapService.geoCodingGetAddress(coordinates).subscribe(result => {
      console.log(result)
      // this.createUpdateForm.controls['place'].setValue(result[0].place)
      this.createUpdateForm.controls['place'].enable()
    })
  }
}
