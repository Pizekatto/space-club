import { SelectionModel } from '@angular/cdk/collections'
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatIconButton } from '@angular/material/button'
import { MatTableDataSource } from '@angular/material/table'
import { DataService } from '@app/data/data.service'
import { FestivalsService } from '@app/data/festivals.service'
import { CHIPS } from '@app/data/filters'
import { Festival, CreateUpdateForm, GeoCodingResult, Coordinates } from '@app/data/interfaces'
import { Locations, MapService } from '@app/map/map.service'
import { BehaviorSubject, Observable, Subject, debounceTime, map, startWith, switchMap, tap, filter } from 'rxjs'

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  unsubscribe = new Subject()
  dataSource: MatTableDataSource<Festival>
  displayedColumns: Array<keyof Festival> = ['title', 'date']

  titles: { [key in keyof Festival]: string } = {
    title: 'Фестивали',
    website: 'Сайт',
    coordinates: 'Координаты',
    date: 'Даты'
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
  places: BehaviorSubject<GeoCodingResult[]>
  placeSelected = false
  tempPoint = false
  counter = 1

  @Input() mapIsReady = false
  @Output() onSelectionChange = new EventEmitter<Festival>()
  @Output() onSelectNewPlace = new EventEmitter<[number, number]>()
  @Output() onTurnSelectMapMode = new EventEmitter<Subject<[number, number]>>()
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
      title: this.fb.control(this.exampleFest.title + this.counter),
      place: this.fb.control<string | null>(null),
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

  addFestival(festival: any) {
    const fest: Festival = { ...festival, date: [festival.date] }
    console.log(fest)
    this.dataSource.data = [fest, ...this.dataSource.data]
    this.closeForm()
  }

  removeFestival(row: Festival) {}

  add() {
    this.plus = true
    this.createUpdateForm.patchValue({
      title: this.exampleFest.title + ++this.counter,
      date: {
        start: this.exampleFest.date.start,
        end: this.exampleFest.date.end
      }
    })
  }

  cancel() {
    this.closeForm()
    this.counter--
  }

  closeForm() {
    this.plus = false
    this.createUpdateForm.reset()
    this.placeSelected = false
    this.tempPoint = false
  }

  selectRow(row: Festival) {
    console.log(row)
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
