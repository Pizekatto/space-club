import { SelectionModel } from '@angular/cdk/collections'
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatButton, MatIconButton } from '@angular/material/button'
import { DataService } from '@app/data/data.service'
import { FestivalsService } from '@app/data/festivals.service'
import { CHIPS } from '@app/data/filters'
import {
  Festival,
  CreateUpdateForm,
  GeoCodingResult,
  Coordinates,
  TableColumns,
  TableHeaderTitles,
  DateRange
} from '@app/data/interfaces'
import { Locations, MapService } from '@app/map/map.service'
import { BehaviorSubject, Observable, Subject, debounceTime, switchMap, tap, filter, distinctUntilChanged } from 'rxjs'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { MatChipListbox, MatChipOption } from '@angular/material/chips'
import { IconService } from '@app/data/icon.service'
import { DataTableDataSource } from '@app/data/dataSource'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  animations: [
    trigger('editView', [
      state('hide', style({ opacity: 0 })),
      state('show', style({ 'z-index': 1, opacity: 1 })),
      transition('show <=> hide', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
    trigger('editHide', [state('hide', style({ visibility: 'hidden' })), state('show', style({}))])
  ]
})
export class DataTableComponent {
  data!: Festival[]
  unsubscribe = new Subject()
  // dataSource!: MatTableDataSource<Festival>
  dataSource!: DataTableDataSource
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
  dateSortRange: DateRange
  createUpdateForm: CreateUpdateForm
  CHIPS = CHIPS
  selectedFilters: string[] = []
  _filters: Locations[] = []
  set filters(value) {
    this._filters = value
    this.filter(value.reduce<string>((acc, item) => acc + '.' + item, ''))
  }
  get filters() {
    return this._filters
  }
  plus = false
  exampleFest = this.festService.exampleFest
  places: BehaviorSubject<GeoCodingResult[]>
  placeSelected = false
  tempPoint = false
  counter = 0
  dateSortRangeValid = false
  selectPointStream?: Subject<[number, number]>
  saveButtonDisable = false

  @Input() mapIsReady = false
  @Input() allPointsStream?: Observable<Coordinates>
  @Output() onSelectionChange = new EventEmitter<Festival>()
  @Output() onSelectNewPlace = new EventEmitter<[number, number]>()
  @Output() onTurnSelectMapMode = new EventEmitter<Subject<[number, number]>>()
  @Output() onCancelSelectMapMode = new EventEmitter<void>()
  @Output() onCancelLastSelect = new EventEmitter<void>()
  @Output() onRemoveFestival = new EventEmitter<number>()
  @Output() onSaveFestival = new EventEmitter<void>()
  @ViewChild('plus') plusBtn!: MatButton
  @ViewChild('dateRangeChip') dateRangeChip!: MatChipOption
  @ViewChild('dateChipListBox') dateChipListBox!: MatChipListbox

  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private festService: FestivalsService,
    private mapService: MapService,
    private icons: IconService,
    private routes: ActivatedRoute
  ) {
    this.data = this.routes.snapshot.data['data']
    this.selection = new SelectionModel<Festival>(this.allowMultiSelect, this.initialSelection)
    this.selection.changed.subscribe(() => {
      this.onSelectionChange.emit(this.selection.selected[0])
    })
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
      start: this.fb.control<Date | null>(null),
      end: this.fb.control<Date | null>(null)
    })
    this.places = new BehaviorSubject([{ place: '', point: null }])
    this.followPlaceTitle()

    this.dateSortRange.statusChanges.subscribe(s => {
      const status = s == 'VALID' ? true : false
      this.dateSortRangeValid = status
      this.dateRangeChip.selected = status
      this.dateRangeChip.selectionChange.emit({ source: this.dateRangeChip, selected: status, isUserInput: true })
    })
  }

  ngOnInit() {
    this.dataSource = new DataTableDataSource(this.data, this.dataService)
    this.dataSource.filterPredicate = this.filterPredicate
    this.places.next([])
  }

  ngOnDestroy() {
    this.unsubscribe.complete()
  }

  /** подписка на изменения поля "Место" в форме
   * запрашивает координаты через геокодинг
   */
  followPlaceTitle() {
    this.createUpdateForm.controls['place'].valueChanges
      .pipe(
        debounceTime(1500),
        distinctUntilChanged(),
        filter(_ => !this.placeSelected),
        filter(val => !!val),
        switchMap((request: any) => this.mapService.geoCodingGetAddress(request)),
        tap(data => {
          this.places.next(data)
        })
      )
      .subscribe()
  }

  /** Сохранение нового Ф */
  addNew = (festival: any, event: MouseEvent) => {
    event.stopPropagation()
    const fest: Festival = { ...festival, date: [festival.date] }
    this.dataSource.setData([fest, ...this.dataSource.data])
    this.closeForm()
    this.onSaveFestival.emit()
  }

  /** Сохранение после редактирования */
  update = (festival: any, event: MouseEvent, row: Festival) => {
    event.preventDefault()
    const i = this.dataSource.data.findIndex(item => item == row)
    const data = this.dataSource.data.map((item, index) => {
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
    this.dataSource.setData(data)
    this.editableRow = null
    this.plusBtn.disabled = false
    this.closeForm()
  }

  /** Нажатие на +, открытие формы добавления нового Ф */
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

  /** Отмена добавления нового Ф */
  cancelAdding = (event: MouseEvent) => {
    event.stopPropagation()
    if (this.tempPoint || this.placeSelected) {
      this.onCancelLastSelect.emit()
    }
    this.closeForm()
    this.counter--
    if (this.selectPointStream) {
      this.onCancelSelectMapMode.emit()
      this.selectPointStream.complete()
    }
  }

  /** Отмена редактирования */
  cancelEditing = (event: MouseEvent) => {
    event.stopPropagation()
    this.editableRow = null
    this.plusBtn.disabled = false
    this.closeForm()
    this.places.next([])
  }

  /** Нажатие на карандаш редактирования Ф
   * если поле "Место" пустое, то запрос геокодинга по координатам и вставка в форму места
   */
  edit(event: MouseEvent, row: Festival) {
    this.editableRow = row
    this.plusBtn.disabled = true
    this.createUpdateForm.patchValue({
      title: row.title,
      coordinates: row.coordinates,
      date: {
        start: row.date ? row.date[0].start : null,
        end: row.date ? row.date[0].end : null
      },
      place: row.place || null
    })
    if (!this.createUpdateForm.value.place) {
      this.mapService.geoCodingGetAddress(row.coordinates[0]).subscribe(v => {
        this.createUpdateForm.patchValue({
          place: v[0].place
        })
      })
    }
    this.createUpdateForm.controls.place.disable()
  }

  /** удаление Ф */
  delete(event: MouseEvent, row: Festival) {
    event.stopPropagation()
    const i = this.dataSource.data.findIndex(item => item === row)
    this.dataSource.setData(this.dataSource.data.filter((_, index) => index != i))
    this.onRemoveFestival.emit(i)
  }

  closeForm() {
    this.plus = false
    this.createUpdateForm.reset()
    this.placeSelected = false
    this.tempPoint = false
    this.createUpdateForm.controls.place.enable()
  }

  /** Нажатие на строку таблицы */
  selectRow(row: Festival) {
    this.selection.select(row)
    this.onSelectionChange.emit(this.selection.selected[0])
  }

  /** функция сравнения стандартная для Angular Material Table DataSource */
  filterPredicate = (data: Festival, filterString: string): boolean => {
    let currentFilters = filterString.split('.').slice(1)
    let result = false
    for (let i = 0; i < currentFilters.length; i++) {
      if (this.dataService.filterFunctions[currentFilters[i]](data, this.dateSortRange.value)) {
        result = true
        break
      }
    }
    return result
  }

  filter(filter: string) {
    this.dataSource.filter = filter
  }

  /** Нажатие на прицел для добавления точки на карту */
  selectPoint(event: MouseEvent, targetButton: MatIconButton) {
    this.saveButtonDisable = true
    event.stopPropagation()
    if (this.tempPoint || this.placeSelected) {
      this.onCancelLastSelect.emit()
    }
    targetButton.disabled = true
    this.createUpdateForm.controls.place.reset()
    this.createUpdateForm.controls.place.disable()

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
        let place
        if (data.length) {
          place = data[0].place
        } else {
          place = 'где-то далеко'
        }
        this.createUpdateForm.patchValue({ place })
        this.placeSelected = true
        this.createUpdateForm.controls.place.enable()
        targetButton.disabled = false
        this.saveButtonDisable = false
      })
    this.selectPointStream = dataStream
  }

  /** очистка поля "Место" в форме
   * удаляет временную точку на карте
   */
  clearPlaceField(clearPlaceAction: EventEmitter<void | number>) {
    this.createUpdateForm.controls['place'].reset()
    this.places.next([])
    if (this.placeSelected) {
      clearPlaceAction.emit()
    }
    this.placeSelected = false
    this.tempPoint = false
  }

  /** Выбор места из автокомплита */
  selectOption(selectOption: MatAutocompleteSelectedEvent) {
    this.placeSelected = true
    const coordinates: [number, number] = this.places.getValue()[Number(selectOption.option.id)].point.coordinates
    this.places.next([])
    this.createUpdateForm.patchValue({ coordinates: [coordinates] })
    // послать одну точку
    this.onSelectNewPlace.emit(coordinates)
  }
}
