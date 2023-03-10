import {
  Component, Input, PipeTransform, HostBinding, ViewChild, ChangeDetectorRef,
  Output, EventEmitter, HostListener, ElementRef, ViewContainerRef, OnDestroy, DoCheck,
  ChangeDetectionStrategy
} from '@angular/core';

import { Keys } from '../../utils';
import { SortDirection } from '../../types';
import { TableColumn } from '../../types/table-column.type';
@Component({
  selector: 'datatable-body-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="datatable-body-cell-label">
      <label
        *ngIf="column.checkboxable"
        class="datatable-checkbox">
        <input
          type="checkbox"
          [checked]="isSelected"
          (click)="onCheckboxChange($event)"
        />
      </label>
      <span class="text"
        *ngIf="!column.cellTemplate"
        [title]="sanitizedValue"
        [innerHTML]="value">
      </span>
      <ng-template #cellTemplate
        *ngIf="column.cellTemplate"
        [ngTemplateOutlet]="column.cellTemplate"
        [ngTemplateOutletContext]="cellContext">
      </ng-template>
    </div>
  `,
  host: {
    class: 'datatable-body-cell'
  }
})
export class DataTableBodyCellComponent implements DoCheck, OnDestroy {

  @Input() rowHeight: any;
  @Input() layout: any;
  @Input() set editmode(val:any){
    this.cellContext.editmode = (this._rowIndex==val)?true:false;
    val=-1;
  }

  @Input() set isSelected(val: boolean) {
    this._isSelected = val;
    this.cellContext.isSelected = val;
    this.cd.markForCheck();
  }

  get isSelected(): boolean {
    return this._isSelected;
  }

  @Input() set expanded(val: boolean) {
    this._expanded = val;
    this.cellContext.expanded = val;
    this.cd.markForCheck();
  }

  get expanded(): boolean {
    return this._expanded;
  }

  @Input() set rowIndex(val: number) {
    this._rowIndex = val;
    this.cellContext.rowIndex = val;
    this.checkValueUpdates();
    this.cd.markForCheck();
  }

  get rowIndex(): number {
    return this._rowIndex;
  }

  @Input() set column(column: TableColumn) {
    this._column = column;
    this.cellContext.column = column;
    this.checkValueUpdates();
    this.cd.markForCheck();
  }

  get column(): TableColumn {
    return this._column;
  }

  @Input() set row(row: any) {
    this._row = row;
    this.cellContext.row = row;
    this.checkValueUpdates();
    this.cd.markForCheck();
  }

  get row(): any {
    return this._row;
  }

  @Input() set sorts(val: any[]) {
    this._sorts = val;
    this.calcSortDir = this.calcSortDir(val);
  }

  get sorts(): any[] {
    return this._sorts;
  }

  @Output() activate: EventEmitter<any> = new EventEmitter();

  @ViewChild('cellTemplate', { read: ViewContainerRef ,static:true}) cellTemplate: ViewContainerRef;

  @HostBinding('class')
  get columnCssClasses(): any {
    let cls = 'datatable-body-cell';
    if (this.column.cellClass) {
      if (typeof this.column.cellClass === 'string') {
        cls += ' ' + this.column.cellClass;
      } else if (typeof this.column.cellClass === 'function') {
        const res = this.column.cellClass({
          row: this.row,
          column: this.column,
          value: this.value
        });

        if (typeof res === 'string') {
          cls += res;
        } else if (typeof res === 'object') {
          const keys = Object.keys(res);
          for (const k of keys) {
            if (res[k] === true) cls += ` ${k}`;
          }
        }
      }
    }
    if (!this.sortDir) cls += ' sort-active';
    if (this.isFocused) cls += ' active';
    if (this.sortDir === SortDirection.asc) cls += ' sort-asc';
    if (this.sortDir === SortDirection.desc) cls += ' sort-desc';
    return cls;
  }

  @HostBinding('style.width.px')
  get width(): any {
    if(this.layout!=='Row')
    return this.column.width;
  }

  @HostBinding('style.height')
  get height(): string | number {
    const height = this.rowHeight;
    if (isNaN(height)) return height;
    return height + 'px';
  }

  sanitizedValue: any;
  value: any = '';
  sortDir: SortDirection;
  isFocused: boolean = false;
  onCheckboxChangeFn = this.onCheckboxChange.bind(this);
  activateFn = this.activate.emit.bind(this.activate);
  public edit:any;

  cellContext: any = {
    onCheckboxChangeFn: this.onCheckboxChangeFn,
    activateFn: this.activateFn,
    row: this.row,
    value: this.value,
    column: this.column,
    isSelected: this.isSelected,
    rowIndex: this.rowIndex,
    editmode:this.editmode,
  };

  private _isSelected: boolean;
  private _sorts: any[];
  private _column: TableColumn;
  private _row: any;
  private _rowIndex: number;
  private _expanded: boolean;
  private _element: any;

  constructor(element: ElementRef, private cd: ChangeDetectorRef) {
    this._element = element.nativeElement;
  }

  ngDoCheck(): void {
    this.checkValueUpdates();
  }

  ngOnDestroy(): void {
    if (this.cellTemplate) {
      this.cellTemplate.clear();
    }
  }
  ngOnInit(){
    this.editmode;
  }


  checkValueUpdates(): void {
    let value = '';

    if (!this.row || !this.column) {
      value = '';
    } else {
      const val = this.column.$$valueGetter(this.row, this.column.prop);
      const userPipe: PipeTransform = this.column.pipe;

      if (userPipe) {
        value = userPipe.transform(val);
      } else if (value !== undefined) {
        value = val;
      }
    }

    if(this.value !== value) {
      this.value = value;
      this.cellContext.value = value;
      this.sanitizedValue = this.stripHtml(value);
      this.cd.markForCheck();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    this.isFocused = true;
  }

  @HostListener('blur')
  onBlur(): void {
    this.isFocused = false;
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    this.activate.emit({
      type: 'click',
      event,
      row: this.row,
      column: this.column,
      value: this.value,
      cellElement: this._element
    });
  }

  @HostListener('dblclick', ['$event'])
  onDblClick(event: MouseEvent): void {
    this.activate.emit({
      type: 'dblclick',
      event,
      row: this.row,
      column: this.column,
      value: this.value,
      cellElement: this._element
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isTargetCell = event.target === this._element;

    const isAction =
      keyCode === Keys.return ||
      keyCode === Keys.down ||
      keyCode === Keys.up ||
      keyCode === Keys.left ||
      keyCode === Keys.right;

    if (isAction && isTargetCell) {
      event.preventDefault();
      event.stopPropagation();

      this.activate.emit({
        type: 'keydown',
        event,
        row: this.row,
        column: this.column,
        value: this.value,
        cellElement: this._element
      });
    }
  }

  onCheckboxChange(event: any): void {
    this.activate.emit({
      type: 'checkbox',
      event,
      row: this.row,
      column: this.column,
      value: this.value,
      cellElement: this._element
    });
  }

  calcSortDir(sorts: any[]): any {
    if (!sorts) return;

    const sort = sorts.find((s: any) => {
      return s.prop === this.column.prop;
    });

    if (sort) return sort.dir;
  }

  stripHtml(html: string): string {
    if(!html.replace) return html;
    return html.replace(/<\/?[^>]+(>|$)/g, '');
  }

}
