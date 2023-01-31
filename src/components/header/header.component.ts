import {
  Component, Output, EventEmitter, Input, HostBinding, ChangeDetectionStrategy
} from '@angular/core';
import { SortType, SelectionType } from '../../types';
import { columnsByPin, columnGroupWidths, columnsByPinArr, translateXY } from '../../utils';
import { DataTableColumnDirective } from '../columns';

@Component({
  selector: 'datatable-header',
  template: `
    <div
      orderable
      (reorder)="onColumnReordered($event)"
      [style.width.px]="columnGroupWidths.total"
      class="datatable-header-inner" [style.width]="(layout=='Row')?'initial':'none'">

     <div
        *ngFor="let colGroup of columnsByPin; trackBy: trackByGroups"
        [class]="'datatable-row-' + colGroup.type"
        [ngStyle]="stylesByGroup(colGroup.type)" [style.width]="(layout=='Row')?'initial':'none'">
        <datatable-header-cell style="{{(layout=='Row')?datatableHeaderCell:''}}"
          *ngFor="let column of colGroup.columns; trackBy: columnTrackingFn"
          resizeable
          [resizeEnabled]="(layout=='Row')?false:column.resizeable"
          (resize)="onColumnResized($event, column)"
          long-press
          [pressModel]="column"
          [minWidth]="60"
          [pressEnabled]="reorderable && column.draggable"
          (longPressStart)="onLongPressStart($event)"
          (longPressEnd)="onLongPressEnd($event)"
          draggable
          [dragX]="reorderable && column.draggable && column.dragging"
          [dragY]="false"
          [dragModel]="column"
          [dragEventTarget]="dragEventTarget"
          [headerHeight]="(layout=='Row')?'42px':headerHeight"
          [column]="column"
          [sortType]="sortType"
          [sorts]="sorts"
          [selectionType]="selectionType"
          [sortAscendingIcon]="sortAscendingIcon"
          [sortDescendingIcon]="sortDescendingIcon"
          [allRowsSelected]="allRowsSelected"
          (sort)="onSort($event)"
          (select)="select.emit($event)"
          (columnContextmenu)="columnContextmenu.emit($event)"
          [layout]="layout"
          >
        </datatable-header-cell>

 

        <div class="dropdown header-menu" *ngIf="isMenuOpen && component=='Persn'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
        >

      <ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
        <li>
          <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

           <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top"
           [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

              <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close"
              [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

             <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle "
             [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

            <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
        </li>
      </ul>
    </div>



<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='Permision'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
>

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close "
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>

<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='User_Permision_List'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
(mouseleave)="actionsVisibility.emit({isActionsVisible:false,event:$event})">

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close "
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>

<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='File_manaer_config'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
(mouseleave)="actionsVisibility.emit({isActionsVisible:false,event:$event})">

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close "
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>

<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='MT'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
(mouseleave)="actionsVisibility.emit({isActionsVisible:false,event:$event})">

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close "
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>

<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='User_Sessin_lis'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
(mouseleave)="actionsVisibility.emit({isActionsVisible:false,event:$event})">

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close "
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>

<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='Navigtion'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
(mouseleave)="actionsVisibility.emit({isActionsVisible:false,event:$event})">

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close "
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>


<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='Pick_Lst'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
(mouseleave)="actionsVisibility.emit({isActionsVisible:false,event:$event})">

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top {{recordState.Inactive ? '':'disabled'}}"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close {{recordState.Archived ? '':'disabled'}}"
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle {{recordState.Lined_Out ? '':'disabled'}}"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>


<div class="dropdown header-menu" *ngIf="isMenuOpen && component=='User_Classificaion'" (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
(mouseleave)="actionsVisibility.emit({isActionsVisible:false,event:$event})">

<ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;top:-16px;padding: 3px;" >
<li>
  <span class="icon-width-18 glyphicon glyphicon-pencil disabled" title="Edit Inline"></span>

   <span class="icon-width-18 cursor-pointer glyphicon glyphicon-triangle-top {{recordState.Inactive ? '':'disabled'}}"
   [style.pointer-events]="recordState?.Inactive ? '':'none'" title="Inactive" (click)="changeStateAll.emit({state:'Inactive'})"></span>

      <span class="icon-width-18 cursor-pointer glyphicon glyphicon-folder-close {{recordState.Archived ? '':'disabled'}}"
      [style.pointer-events]="recordState?.Archived ? '':'none'"  title="Archive" (click)="changeStateAll.emit({state:'Archived'})"></span>

     <span class="icon-width-18 cursor-pointer glyphicon glyphicon-ban-circle {{recordState.Lined_Out ? '':'disabled'}}"
     [style.pointer-events]="recordState?.Lined_Out ? '':'none'" title="Soft Delete" (click)="changeStateAll.emit({state:'Soft Delete'})"></span>

    <span class="cursor-pointer icon-width-18 glyphicon glyphicon-question-sign" title="Audit Log"></span>
</li>
</ul>
</div>
      </div>
    </div>
  `,
  host: {
    class: 'datatable-header'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableHeaderComponent {

  public datatableHeaderCell = {
    'display': 'block',
    'border-right': 'none',
    'height': '42px',
    'width': '100%',
    'border-bottom':  '1px solid #72809b',
    'min-width': '150px',
    'max-width': '150px'
    };

    ngAfterViewInit() {
      //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      //Add 'implements AfterViewInit' to the class.
      this.datatableHeaderCell = this.datatableHeaderCell;
    }

  @Input() sortAscendingIcon: any;
  @Input() sortDescendingIcon: any;
  @Input() scrollbarH: boolean;
  @Input() innerWidth: any;
  @Input() offsetX: number;
  @Input() sorts: any[];
  @Input() sortType: SortType;
  @Input() allRowsSelected: boolean;
  @Input() selectionType: SelectionType;
  @Input() reorderable: boolean;
  @Input() isMenuOpen: boolean;
  @Input() recordState: any;
  @Input() component: any;
  @Input() permissions: any;
  @Input() inactivatable: any;
  @Input() archivable: any;
  @Input() mainRecordState: any;
  @Input() lineOutable: any;
  @Input() layout: any;

  dragEventTarget: any;

  @HostBinding('style.height')
  @Input() set headerHeight(val: any) {
    
    if (val !== 'auto') {
      
      this._headerHeight = `${val}px`;
    } else {
      
      this._headerHeight = val;
    }
  }

  get headerHeight(): any {
    return this._headerHeight;
  }

  @Input() set columns(val: any[]) {
    this._columns = val;

    const colsByPin = columnsByPin(val);
    this.columnsByPin = columnsByPinArr(val);
    this.columnGroupWidths = columnGroupWidths(colsByPin, val);
  }

  get columns(): any[] {
    return this._columns;
  }

  @Output() sort: EventEmitter<any> = new EventEmitter();
  @Output() reorder: EventEmitter<any> = new EventEmitter();
  @Output() resize: EventEmitter<any> = new EventEmitter();
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() changeStateAll: EventEmitter<any> = new EventEmitter();
  @Output() actionsVisibility: EventEmitter<any> = new EventEmitter();
  @Output() columnContextmenu = new EventEmitter<{ event: MouseEvent, column: any }>(false);

  columnsByPin: any;
  columnGroupWidths: any;
  _columns: any[];
  _headerHeight: string;

  onLongPressStart({ event, model }: { event: any, model: any }) {
    model.dragging = true;
    this.dragEventTarget = event;
  }

  onLongPressEnd({ event, model }: { event: any, model: any }) {
    this.dragEventTarget = event;

    // delay resetting so sort can be
    // prevented if we were dragging
    setTimeout(() => {
      model.dragging = false;
    }, 5);
  }

  @HostBinding('style.width')
  get headerWidth(): string {

    if (this.scrollbarH) {
      return this.innerWidth + 'px';
    }

    return '100%';
  }

  trackByGroups(index: number, colGroup: any): any {
    if(index){}
    return colGroup.type;
  }

  columnTrackingFn(index: number, column: any): any {
    if(index){}
    return column.$$id;
  }

  onColumnResized(width: number, column: DataTableColumnDirective): void {
    if (width <= column.minWidth) {
      width = column.minWidth;
    } else if (width >= column.maxWidth) {
      width = column.maxWidth;
    }

    this.resize.emit({
      column,
      prevValue: column.width,
      newValue: width
    });
  }

  onColumnReordered({ prevIndex, newIndex, model }: any): void {
    this.reorder.emit({
      column: model,
      prevValue: prevIndex,
      newValue: newIndex
    });
  }

  onSort({ column, prevValue, newValue }: any): void {
    // if we are dragging don't sort!
    if (column.dragging) return;

    const sorts = this.calcNewSorts(column, prevValue, newValue);
    this.sort.emit({
      sorts,
      column,
      prevValue,
      newValue
    });
  }

  calcNewSorts(column: any, prevValue: number, newValue: number): any[] {
    let idx = 0;

    if (!this.sorts) {
      this.sorts = [];
    }

    const sorts = this.sorts.map((s, i) => {
      s = { ...s };
      if (s.prop === column.prop) idx = i;
      return s;
    });

    if (newValue === undefined) {
      sorts.splice(idx, 1);
    } else if (prevValue) {
      sorts[idx].dir = newValue;
    } else {
      if (this.sortType === SortType.single) {
        sorts.splice(0, this.sorts.length);
      }

      sorts.push({ dir: newValue, prop: column.prop });
    }

    return sorts;
  }

  stylesByGroup(group: string): any {
    const widths = this.columnGroupWidths;
    let offsetX = this.offsetX;
    if(this.layout=='Row') {
      offsetX = 0;
    }

    const styles = {
      width: `${widths[group]}px`
    };

    if (group === 'center') {
      translateXY(styles, offsetX * -1, 0);
    } else if (group === 'right') {
      const totalDiff = widths.total - this.innerWidth;
      const offset = totalDiff * -1;
      translateXY(styles, offset, 0);
    }

    return styles;
  }


}
