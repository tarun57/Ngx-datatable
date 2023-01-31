import {
  Component, Input, HostBinding, ElementRef, Output, KeyValueDiffers, KeyValueDiffer,
  EventEmitter, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, DoCheck
} from '@angular/core';

import {
  columnsByPin, columnGroupWidths, columnsByPinArr, translateXY, Keys
} from '../../utils';
import { ScrollbarHelper } from '../../services';

@Component({
  selector: 'datatable-body-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngFor="let colGroup of columnsByPin; let i = index; trackBy: trackByGroups"
      class="datatable-row-{{colGroup.type}} datatable-row-group"
     
      [ngStyle]="stylesByGroup(colGroup.type)" [style.display]="(layout=='Row')?'inline-block':'flex'" [style.cursor]="(isPerson)?'default':'pointer'">

        <datatable-body-cell
          *ngFor="let column of colGroup.columns; let ii = index; trackBy: columnTrackingFn"
          tabindex="-1"
          [editmode]="editmode"
          [style.display]=" layout=='Row'?'block':''"
          [row]="row"
          [expanded]="expanded"
          [isSelected]="isSelected"
          [rowIndex]="rowIndex"
          [column]="column"
          [rowHeight]="(layout=='Row')?'42':rowHeight"
          (activate)="onActivate($event, ii)"
          style="{{(layout=='Row')?dataTableBody:''}}"
          [layout]="layout">        
        </datatable-body-cell>
    </div>   
    
  `
})
export class DataTableBodyRowComponent implements DoCheck {
  dataTableBody = {
  'display': 'block',
   'border-right': 'none',
   'height': '42px',
   'width': '100%',
   'border-bottom':  '1px solid #72809b',
   'min-width': '150px'
  }

 // For horizontal layout Which is used in Render Engine
 @Input() layout: any;
 @Input() editmode: any;
 @Input()  isPerson: boolean; 

  @Input() set columns(val: any[]) {
    this._columns = val;
    this.recalculateColumns(val);
  }

  get columns(): any[] {
    return this._columns;
  }

  @Input() set innerWidth(val: number) {
    this._innerWidth = val;
    this.recalculateColumns();
  }

  get innerWidth(): number {
    return this._innerWidth;
  }

  @Input() expanded: boolean;
  @Input() rowClass: any;
  @Input() row: any;
  @Input() offsetX: number;
  @Input() isSelected: boolean;
  @Input() rowIndex: number;

  @HostBinding('class')
  get cssClass() {
    let cls = 'datatable-body-row';
    if (this.isSelected) cls += ' active';
    if (this.rowIndex % 2 !== 0) cls += ' datatable-row-odd';
    if (this.rowIndex % 2 === 0) cls += ' datatable-row-even';

    if (this.rowClass) {
      const res = this.rowClass(this.row);
      if (typeof res === 'string') {
        cls += ` ${res}`;
      } else if (typeof res === 'object') {
        const keys = Object.keys(res);
        for (const k of keys) {
          if (res[k] === true) cls += ` ${k}`;
        }
      }
    }

    return cls;
  }

  @HostBinding('style.height.px')
  @Input() rowHeight: number;

  @HostBinding('style.width.px')
  get columnsTotalWidths(): any {
    if(this.layout!=='Row')
    return this.columnGroupWidths.total;
  }

  @Output() activate: EventEmitter<any> = new EventEmitter();

  element: any;
  columnGroupWidths: any;
  columnsByPin: any;
  _columns: any[];
  _innerWidth: number;

  private rowDiffer: KeyValueDiffer<{}, {}>;

  constructor(
    private differs: KeyValueDiffers,
    private scrollbarHelper: ScrollbarHelper,
    private cd: ChangeDetectorRef, element: ElementRef) {
    this.element = element.nativeElement;
    this.rowDiffer = this.differs.find({}).create();
  }

  ngDoCheck(): void {
    if (this.rowDiffer.diff(this.row)) {
      this.cd.markForCheck();
    }
  }
  ngOnInit(){
    this.editmode;
  }

  trackByGroups(index: number, colGroup: any): any {
    if(index){}
    return colGroup.type;
  }

  columnTrackingFn(index: number, column: any): any {
    if(index){}
    return column.$$id;
  }

  stylesByGroup(group: string) {
    const widths = this.columnGroupWidths;
    const offsetX = this.offsetX;
    let styles;
    if(this.layout!=='Row')
    styles = {
      width: `${widths[group]}px`
    };
    else {
      styles = {
      width: 'initial'
      }
    }

    if (group === 'left') {
      translateXY(styles, offsetX, 0);
    } else if (group === 'right') {
      const bodyWidth = parseInt(this.innerWidth + '', 0);
      const totalDiff = widths.total - bodyWidth;
      const offsetDiff = totalDiff - offsetX;
      const offset = (offsetDiff + this.scrollbarHelper.width) * -1;
      translateXY(styles, offset, 0);
    }

    return styles;
  }

  onActivate(event: any, index: number) {
    event.cellIndex = index;
    event.rowElement = this.element;
    this.activate.emit(event);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isTargetRow = event.target === this.element;

    const isAction =
      keyCode === Keys.return ||
      keyCode === Keys.down ||
      keyCode === Keys.up ||
      keyCode === Keys.left ||
      keyCode === Keys.right;

    if (isAction && isTargetRow) {
      event.preventDefault();
      event.stopPropagation();

      this.activate.emit({
        type: 'keydown',
        event,
        row: this.row,
        rowElement: this.element
      });
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseenter(event: Event) {
    this.activate.emit({
        type: 'mouseenter',
        event,
        row: this.row,
        rowElement: this.element
      });
  }

  recalculateColumns(val: any[] = this.columns): void {
    const colsByPin = columnsByPin(val);
    this.columnsByPin = columnsByPinArr(val);
    this.columnGroupWidths = columnGroupWidths(colsByPin, val);
  }

}
