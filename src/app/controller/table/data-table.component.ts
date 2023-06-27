import { SelectionModel } from '@angular/cdk/collections'
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatButton, MatIconButton } from '@angular/material/button'
import { MatTableDataSource } from '@angular/material/table'
import { DataService } from '@app/data/data.service'
import { FestivalsService } from '@app/data/festivals.service'
import { CHIPS } from '@app/data/filters'
import {
  Festival,
  CreateUpdateForm,
  GeoCodingResult,
  Coordinates,
  TableColumns,
  TableHeaderTitles
} from '@app/data/interfaces'
import { Locations, MapService } from '@app/map/map.service'
import { BehaviorSubject, Observable, Subject, debounceTime, map, startWith, switchMap, tap, filter } from 'rxjs'
import { animate, state, style, transition, trigger } from '@angular/animations'

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  animations: [
    trigger('editView', [
      state('hide', style({ opacity: 0 })),
      state('show', style({ 'z-index': 0, opacity: 1 })),
      transition('show <=> hide', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class DataTableComponent {
  unsubscribe = new Subject()
  dataSource: MatTableDataSource<Festival>
  displayedColumns: TableColumns[] = ['title', 'date']
  displayedColumnsWithControls = [...this.displayedColumns, 'controls', 'edit']
  titles: TableHeaderTitles = {
    title: 'Фестивали',
    website: 'Сайт',
    coordinates: 'Координаты',
    date: 'Даты',
    place: 'Место'
  }
  initialSelection = []
  allowMultiSelect = false
  selection: SelectionModel<Festival>
  editableRow: Festival | null = null
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
  plus = false
  exampleFest = this.festService.exampleFest
  places: BehaviorSubject<GeoCodingResult[]>
  placeSelected = false
  tempPoint = false
  counter = 1

  @Input() mapIsReady = false
  @Output() onSelectionChange = new EventEmitter<Festival>()
  @Output() onSelectNewPlace = new EventEmitter<[number, number]>()
  @Output() onTurnSelectMapMode = new EventEmitter<Subject<[number, number]>>()
  @Output() onCancelLastSelect = new EventEmitter<void>()
  @ViewChild('plus') plusBtn!: MatButton

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
      title: this.fb.control(this.exampleFest.title + this.counter),
      place: this.fb.control<string | null>(null, { validators: Validators.required }),
      date: this.fb.group({
        start: this.fb.control(this.exampleFest.date.start),
        end: this.fb.control(this.exampleFest.date.end)
      }),
      coordinates: this.fb.control<Coordinates | null>(null)
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
    this.places = new BehaviorSubject([{ place: '', point: null }])
    this.followPlaceTitle()
  }

  ngOnInit() {
    this.places.next([])
  }

  ngOnDestroy() {
    this.unsubscribe.complete()
  }

  followPlaceTitle() {
    this.createUpdateForm.controls['place'].valueChanges
      .pipe(
        debounceTime(2000),
        filter(_ => !this.placeSelected),
        filter(val => !!val),
        tap(v => console.log(v)),
        switchMap((request: any) => this.mapService.geoCodingGetAddress(request)),
        tap(data => {
          this.places.next(data)
        })
      )
      .subscribe()
  }

  addNew = (festival: any, event: MouseEvent) => {
    event.stopPropagation()
    const fest: Festival = { ...festival, date: [festival.date] }
    console.log(fest)
    this.dataSource.data = [fest, ...this.dataSource.data]
    this.closeForm()
  }

  update = (festival: any, event: MouseEvent, row: Festival) => {
    console.log(event)
    event.preventDefault()
    console.log(festival)
    const i = this.dataSource.data.findIndex(item => item == row)
    this.dataSource.data = this.dataSource.data.map((item, index) => {
      if (index != i) return item
      let date
      if (!item.date || item.date.length == 1) {
        date = [festival.date]
      }
      if (item.date && item.date.length > 1) {
        date = [festival.date, ...item.date.slice(1)]
      }
      return {
        ...item,
        title: festival.title,
        date
      }
    })
    this.editableRow = null
    this.plusBtn.disabled = false
  }

  removeFestival(row: Festival) {}

  add() {
    if (this.plus) {
      return
    }
    this.plus = true
    this.createUpdateForm.patchValue({
      title: this.exampleFest.title + ++this.counter,
      date: {
        start: this.exampleFest.date.start,
        end: this.exampleFest.date.end
      }
    })
  }

  cancelAdding = (event: MouseEvent) => {
    event.stopPropagation()
    if (this.tempPoint || this.placeSelected) {
      this.onCancelLastSelect.emit()
    }
    this.closeForm()
    this.counter--
  }

  cancelEditing = (event: MouseEvent) => {
    event.stopPropagation()
    this.editableRow = null
    this.plusBtn.disabled = false
  }

  edit(event: MouseEvent, row: Festival) {
    // event.stopPropagation()
    // console.log(row)
    this.editableRow = row
    // console.log('Edit')
    this.plusBtn.disabled = true
    this.createUpdateForm.patchValue({
      title: row.title,
      date: {
        start: row.date ? row.date[0].start : null,
        end: row.date ? row.date[0].end : null
      }
    })
  }

  delete(event: MouseEvent, row: Festival) {
    event.stopPropagation()
    // console.log('Delete')
    this.dataSource.data = this.dataSource.data.filter(item => item != row)
  }

  closeForm() {
    this.plus = false
    this.createUpdateForm.reset()
    this.placeSelected = false
    this.tempPoint = false
  }

  selectRow(row: Festival) {
    // console.log(row)
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
  selectPoint(event: MouseEvent, targetButton: MatIconButton) {
    event.stopPropagation()
    if (this.tempPoint || this.placeSelected) {
      this.onCancelLastSelect.emit()
    }
    targetButton.disabled = true
    this.createUpdateForm.controls['place'].reset()
    this.createUpdateForm.controls['place'].disable()
    const dataStream = new Subject<[number, number]>()
    this.onTurnSelectMapMode.emit(dataStream)
    dataStream
      .pipe(
        switchMap(coordinates => {
          this.createUpdateForm.patchValue({ coordinates: [coordinates] })
          return this.mapService.geoCodingGetAddress(coordinates)
        })
      )
      .subscribe(data => {
        this.tempPoint = true
        console.log(data)
        let place
        if (data.length) {
          place = data[0].place
        } else {
          place = 'где-то далеко'
        }
        this.createUpdateForm.patchValue({ place })
        this.placeSelected = true
        this.createUpdateForm.controls['place'].enable()
        targetButton.disabled = false
      })
  }

  clearPlaceField() {
    this.createUpdateForm.controls['place'].reset()
    this.places.next([])
    if (this.placeSelected) {
      this.onCancelLastSelect.emit()
    }
    this.placeSelected = false
    this.tempPoint = false
  }

  /** Выбор места из автокомплита */
  selectOption(selectOption: MatAutocompleteSelectedEvent) {
    console.log(selectOption)
    this.placeSelected = true
    const coordinates = this.places.getValue()[Number(selectOption.option.id)].point.coordinates
    this.places.next([])
    this.createUpdateForm.patchValue({ coordinates: [coordinates] })
    this.onSelectNewPlace.emit(coordinates)
  }
}
