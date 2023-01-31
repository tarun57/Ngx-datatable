import {
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  KeyValueDiffer,
  KeyValueDiffers,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import {
  forceFillColumnWidths, adjustColumnWidths, sortRows,
  setColumnDefaults, throttleable, translateTemplates
} from '../utils';
import { ScrollbarHelper } from '../services';
import { ColumnMode, SortType, SelectionType, TableColumn, ContextmenuType } from '../types';
import { DataTableBodyComponent } from './body';
import { DataTableColumnDirective } from './columns';
import { DatatableRowDetailDirective } from './row-detail';
import { DatatableFooterDirective } from './footer';
import { CookieService } from 'ngx-cookie';
import { UtilsService } from '../../../../../services/utils/utils.service';
import { MainLayoutComponent } from '../../../../../main-layout/main-layout.component';
@Component({
  selector: 'ngx-datatable',
  template: `
    <div
      visibilityObserver
      (visible)="recalculate()">

      <datatable-header
        *ngIf="headerHeight"
        [style.width]="(layout=='Row')?'initial !important':'none'"
        [sorts]="sorts"
        [sortType]="sortType"
        [scrollbarH]="scrollbarH"
        [innerWidth]="(layout=='Row')?'':innerWidth"
        [isMenuOpen]="isMenuOpen"
        [offsetX]="offsetX"
        [columns]="_internalColumns"
        [reorderable]="reorderable"
        [recordState]="recordState"
        [component]="component"
        [permissions]="permissions"
         [inactivatable]="inactivatable"
        [lineOutable]="lineOutable"
        [archivable]="archivable"
        [mainRecordState]="mainRecordState"
        [sortAscendingIcon]="cssClasses.sortAscending"
        [sortDescendingIcon]="cssClasses.sortDescending"
        [allRowsSelected]="allRowsSelected"
        [selectionType]="selectionType"
        (sort)="onColumnSort($event)"
        (resize)="onColumnResize($event)"
        (reorder)="onColumnReorder($event)"
        (select)="onHeaderSelect()"
        (changeStateAll)="changeStateAll.emit($event)"
        (editFnAll)="editFnAll.emit($event)"
        (actionsVisibility)="actionsVisibility.emit($event)"
        (columnContextmenu)="onColumnContextmenu($event)"
        [layout]="layout"
        style="{{(layout=='Row')?dataTableHeader:''}}">
      </datatable-header>
      <!----------------------------------------------------------------------------------------------------------------------------------->
      <!--------------------------------------------------Header Gear Functionality-------------------------------------------------------->
      <!----------------------------------------------------------------------------------------------------------------------------------->
      <div
        *ngIf="isMenuOpen && activeRecord === 'Multiple' && this.component != 'Permission' && this.component != 'modelproperty-automation' && this.component !='Render_Engine' && this.component !='Render_Engine_Mrv'"
        (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
        class="dropdown header-menu"
        style="top:0;position:absolute; left:0">
          <ul class="dropdown-menu header-menu" style="display: block;min-width: 100px;left: 55px;padding: 0px 0;top: 10px;">

          <li [ngClass]="checkisRecordLockByComponent(component,selected) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,selected) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
            <ul class="pointer-events-none" style="list-style: none;padding:0px">

          <li *ngIf="(mainlayout.checkCommonPermissionMultiple(permissions,'Edit',selected) || this.component == 'recordManagerPerson' || this.component == 'recordManagerDesign') && component!='PersonEditCreatePersonClassification'
          && component!='Render_Engine' && component != 'renderEngine' && component != 'propertyAutomaitonDesign' && component != 'formDesign' && component!= 'Render_Engine_srv'
          && this.component != 'Automation_Design' && this.component != 'Automation_Setup' && this.component !== 'Analytics_Additional_Data' && this.component !== 'Analytics_Repository'
          &&  this.component != 'Editable_Qualifier_Group' &&  this.component != 'Required_Qualifier_Group' && this.component !== 'PicklistPropertysrv'
          && this.component !== 'Boiler_Plate_Text' && this.component !== 'TemplateDeign' && this.component != 'Boilerplate_Text_List' && this.component !== 'Boilerplate_Text_Value'
          && getGearMenuItemVisibilityStatus('Edit')  &&  this.component != 'Display_Qualifier_Group' && (mainRecordState !== 'Archived' 
          && mainRecordState !== 'Soft Deleted') && !isStdDev && !isSoftDelete ">
              <a (click)="editFnAll.emit({state:'Edit'});isMenuOpen=false">Edit
              </a>
            </li>

            <li *ngIf="(mainlayout.checkCommonPermissionMultiple(permissions,'Archive',selected) || this.component == 'recordManagerDesign' || this.component == 'recordManagerPerson') && this.component != 'PicklistPropertysrv' && !getArchive(selected) && getGearMenuItemVisibilityStatus('Archive')&& (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted') && this.component !== 'Analytics_Repository' && this.component !== 'onlyAuditLog'" [ngClass]="checkStateCanBeChange('Archive') ? 'wrapper' : '' " [title]="checkStateCanBeChange('Archive') ? 'View is in use on a Link and cannot have a Record State change.' : '' ">
              <a class="pointer-events-none" (click)="changeStateAll.emit({state:'Archived'});isMenuOpen=false">Archive</a>
            </li>
            <li *ngIf="(mainlayout.checkCommonPermissionMultiple(permissions,'Restore',selected) || this.component == 'recordManagerDesign' || this.component == 'recordManagerPerson') && this.component != 'PicklistPropertysrv' && this.component != 'FileVersion' && getGearMenuItemVisibilityStatus('Restore') && (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted' && this.component !== 'onlyAuditLog') ">
              <a (click)="changeStateAll.emit({state:'Active'});isMenuOpen=false">Restore</a>
            </li>
            <li *ngIf="(mainlayout.checkCommonPermissionMultiple(permissions,'Soft Delete',selected) || this.component == 'recordManagerDesign' || this.component == 'recordManagerPerson') && getGearMenuItemVisibilityStatus('Soft Delete') && !getSoftDelete(selected) && getSoftSeletedForFileVersion(selected) && (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')
            && this.component !== 'Analytics_Repository'&& this.component !== 'Model_Property' && !isSoftDelete && this.component !== 'onlyAuditLog' && this.component !== 'Automation_Setup' && this.component !== 'User_Management'
            " [ngClass]="checkStateCanBeChange('Soft Deleted') ? 'wrapper' : '' " [title]="checkStateCanBeChange('Soft Deleted') ? 'View is in use on a Link and cannot have a Record State change.' : '' ">
              <a class="pointer-events-none" (click)="changeStateAll.emit({state:'Soft Deleted'});isMenuOpen=false">Soft Delete</a>
            </li>
          </ul>
          </li>
            <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
              <a (click)="changeStateAll.emit({state:'Audit Log'});isMenuOpen=false">Audit Log</a>
            </li>
          </ul>
    </div>

 <!----------------------------------------------------------------------------------------------------------------------------------->
      <!--------------------------------------------------Header Gear Functionality for render engine-------------------------------------------------------->
      <!----------------------------------------------------------------------------------------------------------------------------------->
    <div
        *ngIf="isMenuOpen && activeRecord === 'Multiple' && (component=='Render_Engine' || component =='Render_Engine_Mrv' || component == 'renderEngine' || component == 'form'|| component== 'Render_Engine_srv')"
        (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
        class="dropdown header-menu"
        style="top:0;position:absolute; left:0">
          <ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;padding: 0px 0">
          <li [ngClass]="checkisRecordLockByComponent(component,selected) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,selected) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
            <ul class="pointer-events-none" style="list-style: none;padding:0px">
          <li *ngIf="mainlayout.checkCommonPermissionMultipleRENew(linkId,'Edit',selected) && isEditable  && getGearMenuItemVisibilityStatus('Edit') && (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
              <a (click)="editFnAll.emit({state:'Edit'});isMenuOpen=false">Edit</a>
            </li>
           
            <li *ngIf="mainlayout.checkCommonPermissionMultipleRENew(linkId,'Archive',selected) && getGearMenuItemVisibilityStatus('Archive')&& (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
              <a (click)="changeStateAll.emit({state:'Archived'});isMenuOpen=false">Archive</a>
            </li>
            <li *ngIf="mainlayout.checkCommonPermissionMultipleRENew(linkId,'Restore',selected) && getGearMenuItemVisibilityStatus('Restore') && (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
              <a (click)="changeStateAll.emit({state:'Active'});isMenuOpen=false">Restore</a>
            </li>
            <li *ngIf="mainlayout.checkCommonPermissionMultipleRENew(linkId,'Soft Delete',selected) && getGearMenuItemVisibilityStatus('Soft Delete')&& (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
              <a (click)="changeStateAll.emit({state:'Soft Deleted'});isMenuOpen=false">Soft Delete</a>
            </li>
</ul>
</li>
            <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
           
              <a (click)="changeStateAll.emit({state:'Audit Log'});isMenuOpen=false">Audit Log</a>
            </li>
          </ul>
    </div>
    <!----------------------------------------------------------------------------------------------------------------------------------->
    <!--------------------------------------------------Header Gear Functionality For Permission-------------------------------------------------------->
    <!----------------------------------------------------------------------------------------------------------------------------------->

    <div
        *ngIf="isMenuOpen && activeRecord === 'Multiple' && this.component === 'Permission'"
        (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})"
        class="dropdown header-menu"
        style="top:0;position:absolute; left:0">
          <ul class="dropdown-menu header-menu" style="display: block;min-width: 50px;left: 55px;padding: 0px 0">
          <li [ngClass]="checkisRecordLockByComponent(component,selected) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,selected) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
            <ul class="pointer-events-none" style="list-style: none;padding:0px">
          <li *ngIf="mainlayout.checkCommonPermissionMultiple(permissions,'Edit',selected)
            && getGearMenuItemVisibilityStatus('Edit') && (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
              <a (click)="editFnAll.emit({state:'Edit'});isMenuOpen=false">Edit</a>
            </li>
           
            <li *ngIf="mainlayout.checkCommonPermissionMultiple(permissions,'Restore',selected) && getGearMenuItemVisibilityStatus('Restore') && (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
              <a (click)="changeStateAll.emit({state:'Active'});isMenuOpen=false">Restore</a>
            </li>
            <li *ngIf="mainlayout.checkCommonPermissionMultiple(permissions,'Archive',selected)
            && getGearMenuItemVisibilityStatus('Archive') && (mainRecordState !== 'Archived Incomplete' && mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
              <a (click)="changeStateAll.emit({state:'Archived'});isMenuOpen=false">Archive</a>
            </li>
            <li *ngIf="mainlayout.checkCommonPermissionMultiple(permissions,'Soft Delete',selected)
            && getGearMenuItemVisibilityStatus('Soft Delete') && (mainRecordState !== 'Archived' && mainRecordState !== 'Soft Deleted')">
           <a (click)="changeStateAll.emit({state:'Soft Deleted'});isMenuOpen=false">Soft Delete</a>
         </li>
         </ul>
         </li>
            <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
             
              <a (click)="changeStateAll.emit({state:'Audit Log'});isMenuOpen=false">Audit Log</a>
            </li>
          </ul>
    </div>
    <!---------------------------------------------------------------------------------------------------------->

      <datatable-body #datatablebody
      class="{{component=='Pick_List_View_Property'?'custom-scroll':''}}"
      [layout]="layout"
      [dropDropColumn]="dropDropColumn"
      [openNewTabLink]="openNewTabLink"
      [openNewTabLinkId]="openNewTabLinkId"
      [linkId]="linkId"
        [rows]="_internalRows"
        [scrollbarV]="scrollbarV"
        [scrollbarH]="scrollbarH"
        [component]="component"
        [isEditable]="isEditable"
        [isSoftDelete]="isSoftDelete"
        [cogFunc]="cogFunc"
        [isLookup]="isLookup"
        [permissions]="permissions"
        [inactivatable]="inactivatable"
        [lineOutable]="lineOutable"
        [archivable]="archivable"
        [mainRecordState]="mainRecordState"
        [mainRecordId]="mainRecordId"
        [activeRecord]="activeRecord"
        [loadingIndicator]="loadingIndicator"
        [externalPaging]="externalPaging"
        [rowHeight]="rowHeight"
        [rowCount]="rowCount"
        [currentRowIndex]="currentRowIndex"
        [offset]="offset"
        [trackByProp]="trackByProp"
        [columns]="_internalColumns"
        [pageSize]="pageSize"
        [offsetX]="offsetX"
        [rowDetail]="rowDetail"
        [selected]="selected"
        [innerWidth]="innerWidth"
        [bodyHeight]="bodyHeight"
        [selectionType]="selectionType"
        [emptyMessage]="messages.emptyMessage"
        [isMenuOpen]="isMenuOpen"
        [isRowMenuOpen]="isRowMenuOpen"
        [isStdDev]="isStdDev"
        [recordManagerHide]="recordManagerHide"
        [rowIdentity]="rowIdentity"
        [rowClass]="rowClass"
        [baseModelTable]="baseModelTable"
        [selectCheck]="selectCheck"
        (page)="onBodyPage($event)"
        (changeState)="changeState.emit($event)"
        (auditlog)="auditlog.emit($event)"
        (dropColumn)="dropColumn.emit($event)"
        (actionsVisibility)="actionsVisibility.emit($event)"
        (activate)="activate.emit($event)"
        (rowContextmenu)="onRowContextmenu($event)"
        (select)="onBodySelect($event)"
        (scroll)="onBodyScroll($event)"
        style="{{(layout=='Row')?datatableBodyStyle:''}}"
        [isPerson]="isPerson"
        >
      </datatable-body>
      <datatable-footer
        *ngIf="footerHeight"
        [rowCount]="rowCount"
        [VisiableRow]=" bodyComponent?.temp?.length"
        [pageSize]="pageSize"
        [offset]="offset"
        [footerHeight]="footerHeight"
        [footerTemplate]="footer"
        [totalMessage]="messages.totalMessage"
        [pagerLeftArrowIcon]="cssClasses.pagerLeftArrow"
        [pagerRightArrowIcon]="cssClasses.pagerRightArrow"
        [pagerPreviousIcon]="cssClasses.pagerPrevious"
        [selectedCount]="selected.length"
        [selectedMessage]="!!selectionType && messages.selectedMessage"
        [pagerNextIcon]="cssClasses.pagerNext"
        (page)="onFooterPage($event)"
        [totalRows] = "bodyComponent?.temp?.length">
      </datatable-footer>
    </div>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./datatable.component.scss'],
  host: {
    class: 'ngx-datatable'
  }
})
export class DatatableComponent implements OnInit, DoCheck, AfterViewInit, AfterViewChecked {
  public newColumn:any;
  public newValues:any;
  public oldValues:any;
  @Output() onChangeWidthModelTable: EventEmitter<any> = new EventEmitter();
  public dataTableHeader = {
    'vertical-align': 'top',
    'display': 'inline-block',
    'width': 'initial'
  };

  datatableBodyStyle = {
    'max-width': 'calc(100% - 150px)',
    'width': 'initial',
    'margin-left': '-5px',
    'display': 'inline-block'
  };

  isPerson = false;
  /**
   * Rows that are displayed in the table.
   */
   @Input() dropDropColumn = false;
   @Input() openNewTabLink = '';
   @Input() openNewTabLinkId = '';
   @Input() cogFunc = true;

  @Input() set rows(val: any) {
    this._rows = val;

    // auto sort on new updates
    if (!this.externalSorting) {
      this._internalRows = sortRows(val, this._internalColumns, this.sorts);
    } else {
      this._internalRows = [...val];
    }

    // recalculate sizes/etc
    this.recalculate();
    this.cd.markForCheck();
  }

  /**
   * Gets the rows.
   */
  get rows(): any {
    return this._rows;
  }

  //multiple record selected
  @Input() recordState: any;

  //set local data paging and show only current page data length
  @Input() isSRV: boolean;

  //module model table details
  @Input() baseModelTable: any;


  // For horizontal layout Which is used in Render Engine
  @Input() layout: any;

  @Input() activeRecord = 'Multiple'; // Options: 'Multiple', 'Single, for Related'

  /**
   * Columns to be displayed.
   */
  @Input() set columns(val: TableColumn[]) {
    if (val) {
      this._internalColumns = [...val];
      setColumnDefaults(this._internalColumns);
      this.recalculateColumns();
    }

    this._columns = val;
  }

  /**
   * Get the columns.
   */
  get columns(): TableColumn[] {
    return this._columns;
  }

  /**
   * List of row objects that should be
   * represented as selected in the grid.
   * Default value: `[]`
   */
  @Input() selected: any[] = [];

  /**
   * Enable vertical scrollbars
   */
  @Input() scrollbarV = false;

  /**
   * Enable menu
   */
  @Input() isMenuOpen = false;

  /**
   * Enable menu
   */
  @Input() isRowMenuOpen = false;

    /**
   * Enable menu
   */
     @Input() isStdDev = false;

  /**
   * Enable menu
   */
  @Input() recordManagerHide = false;

  /**
   * name of component
   */
  @Input() component = '';

  /**
   * name of component
   */
   @Input() isLookup = false;

  /**
   * Enable horz scrollbars
   */
  @Input() scrollbarH = false;

  /**
   * The row height; which is necessary
   * to calculate the height for the lazy rendering.
   */
  @Input() rowHeight:any = 30;

  /**
   * Type of column width distribution formula.
   * Example: flex, force, standard
   */
  @Input() columnMode: ColumnMode = ColumnMode.standard;

  /**
   * The minimum header height in pixels.
   * Pass a falsey for no header
   */
  @Input() headerHeight: any = 30;

  /**
   * The minimum footer height in pixels.
   * Pass falsey for no footer
   */
  @Input() footerHeight:any = 0;

  /**
   * If the table should use external paging
   * otherwise its assumed that all data is preloaded.
   */
  @Input() externalPaging:any = false;

  /**
   * If the table should use external sorting or
   * the built-in basic sorting.
   */
  @Input() externalSorting = false;

  /**
   * The page size to be shown.
   * Default value: `undefined`
   */
  @Input() limit: number = undefined;

  @Input() currentRowIndex: number = undefined;


  @Input() permissions = '';
  @Input() inactivatable = '';
  @Input() archivable = '';
  @Input() lineOutable = '';
  @Input() mainRecordState = '';
  @Input() mainRecordId = '';
  @Input() linkId = '';

  /**
   * The total count of all rows.
   * Default value: `0`
   */
  @Input() set count(val: number) {
    this._count = val;

    // recalculate sizes/etc
    this.recalculate();
  }

  /**
   * Gets the count.
   */
  get count(): number {
    return this._count;

  }

  /**
   * The current offset ( page - 1 ) shown.
   * Default value: `0`
   */
  @Input() offset = 0;

  /**
   * Show the linear loading bar.
   * Default value: `false`
   */
  @Input() loadingIndicator:any = false;

  /**
   * Type of row selection. Options are:
   *
   *  - `single`
   *  - `multi`
   *  - `chkbox`
   *  - `multiClick`
   *  - `cell`
   *
   * For no selection pass a `falsey`.
   * Default value: `undefined`
   */
  @Input() selectionType: SelectionType;

  /**
   * Enable/Disable ability to re-order columns
   * by dragging them.
   */
  @Input() reorderable = true;

  /**
   * The type of sorting
   */
  @Input() sortType: SortType = SortType.single;

  /**
   * Array of sorted columns by property and type.
   * Default value: `[]`
   */
  @Input() sorts: any[] = [];

  @Input() isEditable:boolean;
  @Input() isSoftDelete:boolean;
  /**
   * Css class overrides
   */
  @Input() cssClasses: any = {
    sortAscending: 'datatable-icon-up',
    sortDescending: 'datatable-icon-down',
    pagerLeftArrow: 'datatable-icon-left',
    pagerRightArrow: 'datatable-icon-right',
    pagerPrevious: 'datatable-icon-prev',
    pagerNext: 'datatable-icon-skip'
  };

  /**
   * Message overrides for localization
   *
   * emptyMessage     [default] = 'No data to display'
   * totalMessage     [default] = 'total'
   * selectedMessage  [default] = 'selected'
   */
  @Input() messages: any = {
    // Message to show when array is presented
    // but contains no values
    emptyMessage: 'No data to display',

    // Footer total message
    totalMessage: 'total',

    // Footer selected message
    selectedMessage: 'selected'
  };

  /**
   * This will be used when displaying or selecting rows.
   * when tracking/comparing them, we'll use the value of this fn,
   *
   * (`fn(x) === fn(y)` instead of `x === y`)
   */
  @Input() rowIdentity: (x: any) => any = ((x: any) => x);

  /**
   * Row specific classes.
   * Similar implementation to ngClass.
   *
   *  [rowClass]="'first second'"
   *  [rowClass]="{ 'first': true, 'second': true, 'third': false }"
   */
  @Input() rowClass: any;

  /**
   * A boolean/function you can use to check whether you want
   * to select a particular row based on a criteria. Example:
   *
   *    (selection) => {
   *      return selection !== 'Ethel Price';
   *    }
   */
  @Input() selectCheck: any;

  /**
   * Property to which you can use for custom tracking of rows.
   * Example: 'name'
   */
  @Input() trackByProp: string;


  /**
   * Action Menu Visibility
   *
  */
  @Output() actionsVisibility: EventEmitter<any> = new EventEmitter();

  /**
   * Body was scrolled typically in a `scrollbarV:true` scenario.
   */
  @Output() scroll: EventEmitter<any> = new EventEmitter();

  /**
   * A cell or row was focused via keyboard or mouse click.
   */
  @Output() activate: EventEmitter<any> = new EventEmitter();

  /**
   * A cell or row was selected.
   */
  @Output() select: EventEmitter<any> = new EventEmitter();

  /**
   * Column sort was invoked.
   */
  @Output() sort: EventEmitter<any> = new EventEmitter();

  /**
   * The table was paged either triggered by the pager or the body scroll.
   */
  @Output() page: EventEmitter<any> = new EventEmitter();

  /**
 * Change state of row.
 */
  @Output() changeState: EventEmitter<any> = new EventEmitter();
  /**
* Change state of row.
*/
  @Output() auditlog: EventEmitter<any> = new EventEmitter();
  @Output() dropColumn: EventEmitter<any> = new EventEmitter();


  /**
 * Change state of selected row.
 */
  @Output() changeStateAll: EventEmitter<any> = new EventEmitter();

  /**
* Change state of selected row.
*/
  @Output() editFnAll: EventEmitter<any> = new EventEmitter();

  /**
   * Columns were re-ordered.
   */
  @Output() reorder: EventEmitter<any> = new EventEmitter();

  /**
   * Column was resized.
   */
  @Output() resize: EventEmitter<any> = new EventEmitter();

  /**
   * The context menu was invoked on the table.
   * type indicates whether the header or the body was clicked.
   * content contains either the column or the row that was clicked.
   */
  @Output() tableContextmenu = new EventEmitter<{ event: MouseEvent, type: ContextmenuType, content: any }>(false);

  /**
   * CSS class applied if the header height if fixed height.
   */
  @HostBinding('class.fixed-header')
  get isFixedHeader(): boolean {
    const headerHeight: number | string = this.headerHeight;
    return (typeof headerHeight === 'string') ?
      (<string>headerHeight) !== 'auto' : true;
  }

  /**
   * CSS class applied to the root element if
   * the row heights are fixed heights.
   */

  @HostBinding('class.fixed-row')
  get isFixedRow(): boolean {
    const rowHeight: number | string = this.rowHeight;
    return (typeof rowHeight === 'string') ?
      (<string>rowHeight) !== 'auto' : true;
  }

  /**
   * CSS class applied to root element if
   * vertical scrolling is enabled.
   */
  @HostBinding('class.scroll-vertical')
  get isVertScroll(): boolean {
    return this.scrollbarV;
  }

  /**
   * CSS class applied to the root element
   * if the horziontal scrolling is enabled.
   */
  @HostBinding('class.scroll-horz')
  get isHorScroll(): boolean {
    return this.scrollbarH;
  }

  /**
   * CSS class applied to root element is selectable.
   */
  @HostBinding('class.selectable')
  get isSelectable(): boolean {
    return this.selectionType !== undefined;
  }

  /**
   * CSS class applied to root is checkbox selection.
   */
  @HostBinding('class.checkbox-selection')
  get isCheckboxSelection(): boolean {
    return this.selectionType === SelectionType.checkbox;
  }

  /**
   * CSS class applied to root if cell selection.
   */
  @HostBinding('class.cell-selection')
  get isCellSelection(): boolean {
    return this.selectionType === SelectionType.cell;
  }

  /**
   * CSS class applied to root if single select.
   */
  @HostBinding('class.single-selection')
  get isSingleSelection(): boolean {
    return this.selectionType === SelectionType.single;
  }

  /**
   * CSS class added to root element if mulit select
   */
  @HostBinding('class.multi-selection')
  get isMultiSelection(): boolean {
    return this.selectionType === SelectionType.multi;
  }

  /**
   * CSS class added to root element if mulit click select
   */
  @HostBinding('class.multi-click-selection')
  get isMultiClickSelection(): boolean {
    return this.selectionType === SelectionType.multiClick;
  }

  /**
   * Column templates gathered from `ContentChildren`
   * if described in your markup.
   */

  // @ContentChild(DataTableColumnCellDirective,{static:true}) set rowTemplate(val: QueryList<DataTableColumnCellDirective>) {
  // }



  @ContentChildren(DataTableColumnDirective)
  set columnTemplates(val: QueryList<DataTableColumnDirective>) {
    this._columnTemplates = val;

    if (val) {
      // only set this if results were brought back
      const arr = val.toArray();
     

    

      if (arr.length) {
        // translate them to normal objects
        this._internalColumns = translateTemplates(arr);
        
        setColumnDefaults(this._internalColumns);
        this.recalculateColumns();
      }
    }
  }

  /**
   * Returns the column templates.
   */
  get columnTemplates(): QueryList<DataTableColumnDirective> {

    return this._columnTemplates;
  }

  /**
   * Row Detail templates gathered from the ContentChild
   */
  @ContentChild(DatatableRowDetailDirective,{static:true})
  rowDetail: DatatableRowDetailDirective;

  /**
   * Footer template gathered from the ContentChild
   */
  @ContentChild(DatatableFooterDirective,{static:true})
  footer: DatatableFooterDirective;

  /**
   * Reference to the body component for manually
   * invoking functions on the body.
   */
  @ViewChild(DataTableBodyComponent, { static:true})  bodyComponent: DataTableBodyComponent;

  /**
   * Returns if all rows are selected.
   */
  get allRowsSelected(): boolean {
    return this.selected &&
      this.rows &&
      this.rows.length !== 0 &&
      this.selected.length === this.rows.length;
  }

  element: HTMLElement;
  innerWidth: number;
  pageSize: number;
  bodyHeight: number;
  rowCount: number;
  offsetX = 0;
  rowDiffer: KeyValueDiffer<{}, {}>;

  _count = 0;
  _rows: any[];
  _internalRows: any[];
  _internalColumns: TableColumn[];
  _columns: TableColumn[];
  _columnTemplates: QueryList<DataTableColumnDirective>;
  @ViewChild('datatablebody', { read: ViewContainerRef ,  static:true},) datatable: ViewContainerRef;

  constructor(private cookieService: CookieService,
    private scrollbarHelper: ScrollbarHelper,
    private cd: ChangeDetectorRef,
    element: ElementRef,
    differs: KeyValueDiffers,
    public utils: UtilsService,
    public mainlayout: MainLayoutComponent,public storage: CookieService) {

    // get ref to elm for measuring
    this.element = element.nativeElement;
    this.rowDiffer = differs.find({}).create();
  }

  /**
   * Lifecycle hook that is called after data-bound
   * properties of a directive are initialized.
   */
  ngOnInit(): void {
    
    if(this.component == 'Person') {
      this.isPerson = true;
    }

    // need to call this immediatly to size
    // if the table is hidden the visibility
    // listener will invoke this itself upon show
    this.recalculate();
  }

  /**
   * Lifecycle hook that is called after a component's
   * view has been fully initialized.
   */
  ngAfterViewInit(): void {
    if (!this.externalSorting) {
      this._internalRows = sortRows(this._rows, this._internalColumns, this.sorts);
    }


    // this has to be done to prevent the change detection
    // tree from freaking out because we are readjusting
    requestAnimationFrame(() => {
      this.recalculate();

      // emit page for virtual server-side kickoff
      if (this.externalPaging && this.scrollbarV) {
        this.page.emit({
          count: this.count,
          pageSize: this.pageSize,
          limit: this.limit,
          offset: 0
        });
      }
    });
    
  }

  ngAfterViewChecked() {
    const elementContainer: any = document.getElementsByTagName("ngx-datatable");
    elementContainer.length;
    if (this.component === 'Model_Property' || this.component === 'Model_Create'
      || this.component === 'Record_Audit' || this.component === 'Validation' || this.component === 'Render Engine'
      || this.component === 'RecordManager' || this.component === 'FileManager'
      || this.component === 'MtxRecordManager' || this.component === 'modelViewList' || this.component === 'viewList') {
      this.bodyHeight = (window.innerHeight - 80) - (this.datatable.element.nativeElement.offsetParent.offsetTop + 50) - 400;
    } else if (this.component === 'recordManagerCreation' || this.component === 'Model_Create') {
      this.bodyHeight = (window.innerHeight - 80) - (this.datatable.element.nativeElement.offsetParent?.offsetTop + 50) - 200;
    } else if (this.component === 'workproduct') {
      this.bodyHeight = (window.innerHeight - 80) - (this.datatable.element.nativeElement.offsetParent?.offsetTop + 50) - 75;
    } else{
      this.bodyHeight = (window.innerHeight - 80) - (this.datatable.element.nativeElement.offsetParent?.offsetTop + 50);
    }

    if (this.component === 'FileManager') {
      this.bodyHeight = (window.innerHeight - 80) - (this.datatable.element.nativeElement.offsetParent?.offsetTop + 50) - 450;
    }
    if (this.utils.auditLogTable === 'renderEngine' && this.component === 'Record_Audit') {
      this.bodyHeight = (window.innerHeight - 80) - (this.datatable.element.nativeElement.offsetParent?.offsetTop + 50);
    }
  }

  /**
   * Lifecycle hook that is called when Angular dirty checks a directive.
   */
  ngDoCheck(): void {
    if (this.rowDiffer.diff(this.rows)) {
      if (!this.externalSorting) {
        this._internalRows = sortRows(this._rows, this.columns, this.sorts);
      } else {
        this._internalRows = [...this.rows];
      }

      this.recalculatePages();
      this.cd.markForCheck();
    }
  }

  /**
   * Recalc's the sizes of the grid.
   *
   * Updated automatically on changes to:
   *
   *  - Columns
   *  - Rows
   *  - Paging related
   *
   * Also can be manually invoked or upon window resize.
   */
  recalculate(): void {
    this.recalculateDims();
    this.recalculateColumns();
  }

  /**
   * Window resize handler to update sizes.
   */
  @HostListener('window:resize')
  @throttleable(5)
  onWindowResize(): void {
    this.bodyHeight = (window.innerHeight - 80) - (this.datatable.element.nativeElement.offsetParent.offsetTop + 50);
    this.recalculate();
  }

  /**
   * Recalulcates the column widths based on column width
   * distribution mode and scrollbar offsets.
   */
  recalculateColumns(
    columns: any[] = this._internalColumns,
    forceIdx = -1,
    allowBleed: boolean = this.scrollbarH): any {

    if (!columns) return;

    let width = this.innerWidth;
    if (this.scrollbarV) {
      width = width - this.scrollbarHelper.width;
    }

    if (this.columnMode === ColumnMode.force) {
      forceFillColumnWidths(columns, width, forceIdx, allowBleed);
    } else if (this.columnMode === ColumnMode.flex) {
      adjustColumnWidths(columns, width);
    }
    if(this.newColumn?.name){
      const index = columns.findIndex( x => this.newColumn?.name === x?.name );
      if(this.newValues != this._internalColumns[index].width){
        const newWidth = this._internalColumns[index].width - this.newValues;
        if(typeof columns[index+1] != 'undefined') {
        const w = columns[index+1].width;
        columns[index+1].width = w + newWidth;
        columns[index+1].$$oldWidth = w + newWidth;
       
      }
      }
    } else {
      if(this.newColumn?.$$id){
        const index = columns.findIndex( x => this.newColumn?.$$id === x?.$$id );
        if(this.newValues != this._internalColumns[index]?.width){
          const newWidth = this._internalColumns[index]?.width - this.newValues;
          if(typeof columns[index+1] != 'undefined') {
          const w = columns[index+1].width;
          columns[index+1].width = w + newWidth;
          columns[index+1].$$oldWidth = w + newWidth;
          
        }
        }
      }

    }
    this.onChangeWidthModelTable.emit();
    return columns;
  }

  /**
   * Recalculates the dimensions of the table size.
   * Internally calls the page size and row count calcs too.
   *
   */
  recalculateDims(): void {
    const dims = this.element.getBoundingClientRect();
    this.innerWidth = Math.floor(dims.width);

    if (this.scrollbarV) {
      let height = dims.height;
      
      if (this.headerHeight) height = height - this.headerHeight;
      if (this.footerHeight) height = height - this.footerHeight;
      this.bodyHeight = height;
    }

    this.recalculatePages();
  }

  /**
   * Recalculates the pages after a update.
   */
  recalculatePages(): void {
    this.pageSize = this.calcPageSize();
    this.rowCount = this.calcRowCount();
  }

  /**
   * Body triggered a page event.
   */
  onBodyPage({ offset }: any): void {
    this.offset = offset;

    this.page.emit({
      count: this.count,
      pageSize: this.pageSize,
      limit: this.limit,
      offset: this.offset
    });
  }

  /**
   * The body triggered a scroll event.
   */
  onBodyScroll(event: MouseEvent): void {

    this.offsetX = event.offsetX;
    this.scroll.emit(event);
  }

  /**
   * The footer triggered a page event.
   */
  onFooterPage(event: any) {
    
    this.offset = event.page - 1;
    if(this.component === 'Automation_Design'){
      if (event.pageSize === "all") {
        event.pageSize = "100000000000000000";
      }
    } else if(this.component === 'Model_Create'){
      if (event.pageSize === "all") {
        event.pageSize = "100000000000000000";
      }
    } else {
    if (event.pageSize === "all") {
      event.pageSize = "all";
    }
  }
    this.pageSize = event.pageSize;
    this.bodyComponent.updateOffsetY(this.offset);

    this.page.emit({
      count: this.count,
      pageSize: this.pageSize,
      limit: this.limit,
      offset: this.offset
    });

    this.cookieService.putObject(this.component + 'compData', { "offset": this.offset, "pageSize": this.pageSize });
  }

  /**
   * Recalculates the sizes of the page
   */
  calcPageSize(val: any[] = this.rows): number {
    // Keep the page size constant even if the row has been expanded.
    // This is because an expanded row is still considered to be a child of
    // the original row.  Hence calculation would use rowHeight only.
    if (this.scrollbarV) {
      const size = Math.ceil(this.bodyHeight / this.rowHeight);
      return Math.max(size, 0);
    }

    // if limit is passed, we are paging
    if (this.limit !== undefined) return this.limit;

    // otherwise use row length
    if (val) return val.length;

    // other empty :(
    return 0;
  }

  /**
   * Calculates the row count.
   */
  calcRowCount(val: any[] = this.rows): number {
    if (!this.externalPaging) {
      if (!val) return 0;
      return val.length;
    }

    return this.count;
  }

  /**
   * The header triggered a contextmenu event.
   */
  onColumnContextmenu({ event, column }: any): void {
    this.tableContextmenu.emit({ event, type: ContextmenuType.header, content: column });
  }

  /**
   * The body triggered a contextmenu event.
   */
  onRowContextmenu({ event, row }: any): void {
    this.tableContextmenu.emit({ event, type: ContextmenuType.body, content: row });
  }

  /**
   * The header triggered a column resize event.
   */
  onColumnResize({ column, newValue }: any): void {
    /* Safari/iOS 10.2 workaround */
    if (column === undefined) {
      return;
    }
    
    this.newColumn = column;
    this.newValues = newValue;
    let idx: number;
    const cols = this._internalColumns.map((c, i) => {
      c = { ...c };

      if (c.$$id === column.$$id) {
        idx = i;
        c.width = newValue;

        // set this so we can force the column
        // width distribution to be to this value
        c.$$oldWidth = newValue;
      }

      return c;
    });

    this.recalculateColumns(cols, idx);
    this._internalColumns = cols;

    this.resize.emit({
      column,
      newValue
    });
  }

  /**
   * The header triggered a column re-order event.
   */
  onColumnReorder({ column, newValue, prevValue }: any): void {
    const cols = this._internalColumns.map(c => {
      return { ...c };
    });

    const prevCol = cols[newValue];
    cols[newValue] = column;
    cols[prevValue] = prevCol;

    this._internalColumns = cols;

    this.reorder.emit({
      column,
      newValue,
      prevValue
    });
  }

  /**
   * The header triggered a column sort event.
   */
  onColumnSort(event: any): void {
    const { sorts } = event;

    // this could be optimized better since it will resort
    // the rows again on the 'push' detection...
    if (this.externalSorting === false) {
      // don't use normal setter so we don't resort
      this._internalRows = sortRows(this.rows, this._internalColumns, sorts);
    }

    this.sorts = sorts;
    // Always go to first page when sorting to see the newly sorted data
    
    this.bodyComponent.updateOffsetY(this.offset);
    this.sort.emit(event);
  }

  /**
   * Toggle all row selection
   */
  onHeaderSelect(): void {
    // before we splice, chk if we currently have all selected
    const allSelected = this.selected.length === this.bodyComponent.temp.length;

    // remove all existing either way
    this.selected = [];

    // do the opposite here
    if (!allSelected) {
      this.selected.push(... this.bodyComponent.temp);
    }

    this.select.emit({
      selected: this.selected
    });

   if (this.component === 'modelViewList' || this.component === 'viewList'
       || this.component === 'fileDesign' || this.component === 'extensionTable' || this.component === 'FileVersion' || this.component === 'propertyAutomaitonDesign' || this.component === 'TemplateDeign' || this.component === 'File_Record' || this.component === 'Model_Table' || this.component === 'Render_Engine' || this.component =='Render_Engine_Mrv' || this.component== 'Render_Engine_srv' || this.component === 'FileManager'
      || this.component === 'TaskRecordManager' || this.component === 'modelproperty-automation' || this.component === 'property-automation'
      || this.component === 'Model_Property' || this.component === 'RecordManager' || this.component === 'Person' || this.component === 'formDesign' || this.component == 'Automation_Design' || this.component == 'Email_Information'|| this.component == 'Email_Notice' || this.component == 'Setup Qualifier'  || this.component == 'Schedule_Record_Setup'||  this.component == 'Automation' || this.component === 'PtmModuleTsdAndGD'
      || this.component === 'Navigation' || this.component === 'Permission' || this.component === 'System_User' || this.component === 'Location'
      || this.component === 'User_Classification' || this.component === 'User_Classification_Edit' || this.component === 'File_manager_config' || this.component == 'Controlled_Document' || this.component == 'File-amendement' || this.component === 'Boilerplate_Text_Value' || this.component === 'Boilerplate_Text_Value'|| this.component=='Boiler_Plate_Text' || this.component == 'Boilerplate_Text_List' ||  this.component === 'Task_manager' || this.component === 'Unit' || this.component === 'listMember'
      || this.component === 'companyContactInformation' || this.component === 'personsCompany' || this.component === 'company' || this.component === 'acquiredCompany'
      || this.component === 'Pick_List' || this.component === 'PersonEditCreate' || this.component === 'User_Management' || this.component === 'PersonEditCreatePersonClassification' || this.component === 'PersonCompany'
      || this.component === 'MTxfileAssociation' || this.component === 'MTxfileHistory' || this.component === 'MTxFileManager'
      || this.component === 'MTxFileVersion' || this.component === 'EditableQualifier' || this.component === 'Validation' || this.component === 'Editable_Qualifier_Group'
      || this.component === 'Required_Qualifier' || this.component === 'Required_Qualifier_Group' || this.component === 'Display_Qualifier_Group' || this.component === 'Related_Filter' || this.component === 'Analytics_Query' || this.component === 'Level_Qualifiers' || this.component === 'Text_Qualifier' || this.component === 'Automation_Setup' || this.component === 'Setup_Qualifier'  || this.component === 'Action_Table_Setup'    || this.component == 'Analytics_Additional_Data' || this.component == 'Analytics_Repository' || this.component === 'Validation_Qualifier' || this.component === 'DisplayQualifier' || this.component === 'Validation'
       || this.component === 'DependencyQualifier' || this.component === 'Pick_List_View_Property' || this.component === 'Validation-srv' || this.component == 'Render Engine' || this.component === 'MTxUserCreatedMTFile' || this.component === 'Related_View' || this.component == 'PicklistPropertysrv' || this.component == 'recordManagerDesign' || this.component == 'recordManagerPerson' || this.component == 'recordManagerClassification') {
      this.recordActivityState = this.utils.onSelectModelTableNew(this.selected, this.component);
    }
   
  }

  getSelectedRowIndex() {
    
  }

  /**
   * A row was selected from body
   */
  public recordActivityState = { Inactive: false, Reactive: false, Archived: false, Restorable: false, Lined_Out: false };

  onBodySelect(event: any): void {
    this.select.emit(event);
  if (this.component === 'modelViewList' ||  this.component === 'viewList' || this.component === 'Model_Table' || this.component === 'Render_Engine' || this.component =='Render_Engine_Mrv' || this.component== 'Render_Engine_srv' || this.component === 'fileDesign' ||  this.component === 'extensionTable'
      || this.component === 'TaskRecordManager' || this.component === 'FileManager' || this.component === 'Model_Property' || this.component === 'propertyAutomaitonDesign' || this.component === 'FileVersion' || this.component === 'TemplateDeign' || this.component === 'File_Record'
      || this.component === 'MtxRecordManager' || this.component === 'RecordManager' || this.component === 'Person' || this.component === 'formDesign' || this.component == 'Automation_Design' || this.component == 'Analytics_Additional_Data' || this.component == 'Analytics_Repository' || this.component == 'Email_Notice'|| this.component == 'Email_Information' || this.component == 'Automation' || this.component === 'PtmModuleTsdAndGD' || this.component === 'PtmModule'
      || this.component === 'Navigation' || this.component === 'Permission' || this.component === 'System_User' || this.component === 'Location'
      || this.component === 'User_Classification' || this.component === 'File_manager_config' || this.component == 'Controlled_Document' || this.component == 'File-amendement' || this.component=='Boiler_Plate_Text' || this.component == 'Boilerplate_Text_List' || this.component=='Boilerplate_Text_Value' || this.component=='Boilerplate_Text_Value' || this.component === 'Task_manager' || this.component === 'Unit' || this.component === 'listMember'
      || this.component === 'company' || this.component === 'companyContactInformation' || this.component === 'personsCompany' || this.component === 'acquiredCompany'
      || this.component === 'Pick_List' || this.component === 'Pick_List_View_Property' || this.component === 'Location' || this.component === 'PersonEditCreate' || this.component === 'User_Management' || this.component === 'PersonEditCreatePersonClassification'
      || this.component === 'PersonCompany' || this.component === 'MTxfileAssociation' || this.component === 'MTxfileHistory' || this.component === 'Editable_Qualifier_Group' || this.component === 'Required_Qualifier_Group'
      || this.component === 'MTxFileManager' || this.component === 'MTxFileVersion' || this.component === 'EditableQualifier' || this.component === 'Validation_Qualifier'
      || this.component === 'Validation' || this.component === 'Required_Qualifier' || this.component === 'Related_Filter' || this.component === 'Analytics_Query' || this.component === 'Level_Qualifiers' || this.component === 'Text_Qualifier' || this.component === 'Automation_Setup' || this.component === 'Setup_Qualifier' || this.component === 'Action_Table_Setup' ||  this.component === 'DisplayQualifier'
      || this.component === 'Validation' || this.component === 'DependencyQualifier' || this.component === 'Validation-srv' || this.component == 'Render Engine'
      || this.component === 'MTxUserCreatedMTFile' || this.component === 'User_Classification_Edit' || this.component === 'Related_View' || this.component == 'Display_Qualifier_Group' || this.component == 'PicklistPropertysrv' || this.component == 'recordManagerDesign' || this.component == 'recordManagerPerson' || this.component == 'recordManagerClassification') {
      this.recordActivityState = this.utils.onSelectModelTableNew(this.selected, this.component);
    }
  }

  getArchive(selected:any){
    let isVisible:boolean = false;
     for (let i = 0; i < selected.length; i++) {
      if(selected[i].isSystemGenerated){
        isVisible = true;
        break;
      }
     }
     return isVisible;
  }

  getSoftDelete(selected:any){
    let isVisible:boolean = false;
     for (let i = 0; i < selected.length; i++) {
      if(selected[i].isSystemGenerated){
        isVisible = true;
        break;
      }
     }
     return isVisible;
  }

  getSoftSeletedForFileVersion(selected:any){
    let isVisible:boolean = true;
    if(this.component == 'FileVersion'){
      for (let i = 0; i < selected.length; i++) {
        if(selected[i].status == 'Approved' || selected[i].status == 'Uploaded'){
          isVisible = false;
          break;
        }
      }
    }
    if(this.component == 'File-amendement'){
      for (let i = 0; i < selected.length; i++) {
        if(selected[i].status == 'Approved' ){
          isVisible = false;
          break;
        }
      }
    }
    return isVisible;
  }

  getGearMenuItemVisibilityStatus(status: string):any {

    if (this.component === 'PtmModuleTsdAndGD') {
      if (status === 'Archive') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].workProductPhase === 'In Development'
            || this.selected[index].workProductPhase === 'Testing')
            && this.selected[index].workProductPhase.recordState !== 'Archived') {
            checkInactive = false;
          } else {
            checkInactive = true;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
      if (status === 'Soft Delete') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].workProductPhase === 'In Development'
            && this.selected[index].workProductPhase !== 'Testing')) {
            checkInactive = false;
          } else {
            checkInactive = true;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
      if (status === 'Restore') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].workProductPhase === 'In Development'
            || this.selected[index].workProductPhase === 'Testing')) {
            checkInactive = false;
          } else {
            checkInactive = true;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
    }
    if (this.component === 'Navigation') {
      if (status === 'Archive') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].name !== 'System Base')) {
            checkInactive = false;
          } else {
            checkInactive = true;
          }
          if(!this.selected[index].isNavigationArchivable){
            checkInactive = true;
            break;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
      if (status === 'Soft Delete') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].name !== 'System Base')) {
            checkInactive = false;
          } else {
            checkInactive = true;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
      if (status === 'Inactive') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].name !== 'System Base')) {
            checkInactive = false;
          } else {
            checkInactive = true;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
    }

    if (this.component === 'PersonEditCreate') {
      if (status === 'Archive') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].actualprimaryNotificationEmail || this.selected[index].recordState == 'Archived') {
            locationEdit = false;
          }
        }
       return locationEdit;
      }
      if (status === 'Soft Delete') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].actualprimaryNotificationEmail || this.selected[index].recordState == 'Archived') {
            locationEdit = false;
          }
        }
       return locationEdit;
      }
    }
    if (this.component === 'User_Management') {
      if (status === 'Archive') {     
        return this.selected.length == 1 && this.selected[0].recordState != 'Archived' ?  true : false;
      } else if (status === 'Restore') {     
        return this.selected.length == 1 && this.selected[0].recordState != 'Active' ?  true : false;
      } else if (status === 'Edit') {     
        return this.selected.length == 1 && this.selected[0].recordState == 'Active' ?  true : false;
      }           
    }

    if (this.component === 'User_Classification') {
      if (status === 'Inactive') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].type === 'User' && this.selected[index].name === 'System Administrator' ) || (this.selected[index].type === 'User' && this.selected[index].name === 'Application Administrator' ) || (this.selected[index].type === 'User' && this.selected[index].name === 'Internal User' )) {
            checkInactive = true;
            break;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
      if (status === 'Archive' || status === 'Edit') {
        let checkInactive = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].type === 'User' && this.selected[index].name === 'External User' ) || (this.selected[index].type === 'User' && this.selected[index].name === 'Internal User' ) || (this.selected[index].type === 'Administrator' && this.selected[index].name === 'System Administrator' ) || (this.selected[index].type === 'Administrator' && this.selected[index].name === 'Application Administrator' ) || (this.selected[index].type === 'Administrator' && this.selected[index].name === 'User Administrator' )) {
            checkInactive = true;
            break;
          }
        }
        if (checkInactive) {
          return false;
        }
      }
    }


 
    if (this.component === 'Location') {
      if (status === 'Edit') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].category === 'Cabinet/Locker' || this.selected[index].category === 'Room Shelf') {
            locationEdit = false;
          }
        }
        if (locationEdit) {
          return false;
        }
      }
    }
    if (this.component === 'RecordManager') {
      if (status === 'Edit') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
    
            if (this.selected[index].recordState == 'Archived') {
              locationEdit = false;
            }
         if (this.selected[index].type === 'User') {
          if (this.storage.get('userId') !== this.selected[index].user) {
            locationEdit = false;
          }
        }
        }
        return locationEdit;
        
      }
    }

    if (this.component === 'Permission') {
      if (status === 'Restore') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
      
          if ((this.selected[index].navigationNavigation.recordState == 'Archived' && this.selected[index].recordState == 'Archived') || this.selected[index].recordState == 'Active') {
            locationEdit = false;
          }

        }
        return locationEdit;
        
      }
    }

  

    if (this.component === 'Model_Property') {
      if (status === 'Archive') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].category !== 'User Created'
          || this.selected[index].recordState !== 'Active' || this.selected[index].id == this.selected[index].tableRepresentation) {
            locationEdit = false;
          }
        }
       return locationEdit;
      }
    }
    if (this.component === 'modelViewList') {
      if (status === 'Archive') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].recordState !== 'Active' && this.selected[index].recordState !== 'Active Incomplete') || this.selected[index]?.isSystemGenerated ) {
            locationEdit = false;
          }
        }
       return locationEdit;
      }if(status === 'Soft Delete'){
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Archived' || this.selected[index].recordState == 'Soft Deleted' || this.selected[index]?.isSystemGenerated) {
            locationEdit = false;
          }
        }
       return locationEdit;
      }
    }

    if (this.component === 'viewList') {
      if (status === 'Archive') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].recordState !== 'Active' && this.selected[index].recordState !== 'Active Incomplete') || this.selected[index]?.isSystemGenerated) {
            locationEdit = false;
          }
        }
       return locationEdit;
      }if(status === 'Soft Delete'){
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Archived' || this.selected[index]?.isSystemGenerated || this.selected[index].recordState == 'Soft Deleted') {
            locationEdit = false;
          }
        }
       return locationEdit;
      }
    }

    

    if (this.component === 'Model_Property') {
      if (status === 'Edit') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].category !== 'User Created'
          || this.selected[index].recordState !== 'Active') {
            locationEdit = false;
          }
        }
       return locationEdit;
       
      }
    }

    if (this.component === 'Model_Table') {
      if(status == 'Restore'){
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].type =='File' &&  this.selected[index].category == 'User Created'){
           locationEdit = false;
          }
        }
        return locationEdit;
      }
      if (status === 'Archive') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if ((this.selected[index].category === 'System' || this.selected[index].category === 'System Plus' || this.selected[index].category === 'Specialized') && this.selected[index].recordState == 'Active' ) {
            locationEdit = true;
            break;
          }else if (this.selected[index].recordState !== 'Active') {
            locationEdit = true;
            break;
          }
        }
        if (!locationEdit) {
          return true;
        } else {
          return false;
        }
      }
      if (status === 'Edit') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].category === 'Specialized' || this.selected[index]?.category  == 'System' || this.selected[index].recordState !== 'Active') {
            locationEdit = false;
          }
        }
       return locationEdit;
      
      }
    }

    if (this.component === 'Analytics_Query' || this.component === 'Text_Qualifier' || this.component === 'Automation_Setup' || this.component === 'Setup_Qualifier' || this.component === 'Action_Table_Setup' || this.component === 'Boilerplate_Text_Value') {
      if (status === 'Archive') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Active' ) {
            locationEdit = false;
            break;
          }else if (this.selected[index].recordState !== 'Active') {
            locationEdit = true;
            break;
          }
        }
        if (!locationEdit) {
          return true;
        } else {
          return false;
        }
      }
      if (status === 'Restore') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Active' ) {
            locationEdit = true;
            break;
          } else if (this.selected[index].recordState == 'Archived') {
            locationEdit = false;
            
          }
        }
        if (!locationEdit) {
          return true;
        } else {
          return false;
        }
      }
      if (status === 'Soft Delete') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Archived' ) {
            locationEdit = true;
            break;
          } else if (this.selected[index].recordState == 'Active') {
            locationEdit = false;
            break;
          }
        }
        if (!locationEdit) {
          return true;
        } else {
          return false;
        }
      }
    }

    if (this.component === 'Level_Qualifiers') {
      if (status === 'Archive') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Active' ) {
            locationEdit = false;
            
          }else if (this.selected[index].recordState !== 'Active') {
            locationEdit = true;
            break;
          }
        }
        if (!locationEdit) {
          return true;
        } else {
          return false;
        }
      }
      if (status === 'Restore') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Active' ) {
            locationEdit = true;
            break;
          } else if (this.selected[index].recordState == 'Archived') {
            locationEdit = false;
            
          }
        }
        if (!locationEdit) {
          return true;
        } else {
          return false;
        }
      }
      if (status === 'Soft Delete') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].recordState == 'Archived' ) {
            locationEdit = true;
            break;
          } else if (this.selected[index].recordState == 'Active') {
            locationEdit = true;
            break;
          }
        }
        if (!locationEdit) {
          return true;
        } else {
          return false;
        }
      }
    }

    if (this.component === 'recordManagerDesign') {
      if (status === 'Restore') {
        let locationEdit = true;
        for (let index = 0; index < this.selected.length; index++) {
          // if (this.selected[index].isActive == false) {
          if (this.selected[index].recordState == 'Active' || this.selected[index].isActive == false) {
            locationEdit = false;
          }
        }
       return locationEdit;
      }
    }

    // 2910
    if (this.component === 'recordManagerPerson') {
      // if (status === 'Archive' || status === 'Soft Delete' || status === 'Edit') {
      //   let locationEdit = true;
      //   for (let index = 0; index < this.selected.length; index++) {
      //     if (this.selected[index]?.categoryType == 'System') {
      //       locationEdit = false;
      //     }
      //   }
      //  return locationEdit;
      // }
      if (status == 'Audit Log') {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index]?.recordState == 'Active' || this.selected[index]?.recordState == 'Archived' || this.selected[index]?.recordState == 'Active Incomplete') {
            locationEdit = true;
          }
        }
        return locationEdit;
      }
    }

      if (status === 'Edit') {
        return this.utils.headerGearActivityState.Inactive === this.utils.headerGearActivityState.TotalCount
          && (this.component !== 'MTxUserCreatedMTFile' && this.component !== 'formDesign' && this.component !== 'Navigation'  && this.component !== 'Model_Property'
          && this.component !== 'RecordManager'
            && this.component !== 'System_User' && this.component !== 'fileDesign' 
            && this.component !== 'Task_manager' && this.component !== 'listMember'
            && this.component !== 'Navigation' && this.component !== 'acquiredCompany'
            && this.component !== 'modelViewList' && this.component !== 'viewList' && this.component !== 'RequiredRecord'
            && this.component !== 'Pick_List' && this.component !== 'Pick_List_View_Property' && this.component !== 'PersonCompany'
            && this.component !== 'MTxFileVersion' && this.component !== 'MTxfileAssociation' && this.component !== 'EditableQualifier'
            && this.component !== 'Validation' && this.component !== 'Required_Qualifier' && this.component !== 'DisplayQualifier' && this.component !== 'Editable_Qualifier_Group' && this.component !== 'Required_Qualifier_Group'
            && this.component !== 'DependencyQualifier' && this.component !== 'Validation' && this.component !== 'Related_Filter' && this.component !== 'Level_Qualifiers'
            && this.component !== 'Validation-srv' && this.component !== 'personsCompany' && this.component !== 'Validation_Qualifier'
          && this.component !== 'User_Classification_Edit'  && this.component !== 'onlyAuditLog'&& this.component !== 'Related_View' && this.component !== 'Render Engine' && this.component !== 'Render_Engine_srv');
      } else if (status === 'Inactive') {
      
          return this.utils.headerGearActivityState.Inactive === this.utils.headerGearActivityState.TotalCount;

      } else if (status === 'Reactive') {
        
          return this.utils.headerGearActivityState.Reactive === this.utils.headerGearActivityState.TotalCount;
       
      } else if (status === 'Archive') {
        
          return this.utils.headerGearActivityState.Archived === this.utils.headerGearActivityState.TotalCount;
       
      } else if (status === 'Archive & Create') {
        
          return true;
       
      } else if (status === 'Restore') {
        
          return this.utils.headerGearActivityState.Restorable === this.utils.headerGearActivityState.TotalCount;

      } else if (status === 'Soft Delete') {
        
          return this.utils.headerGearActivityState.Lined_Out === this.utils.headerGearActivityState.TotalCount;
       
      } else if (status === 'Audit Log') {
        return ((this.utils.headerGearActivityState.AuditLog === this.utils.headerGearActivityState.TotalCount && this.component !== 'workProduct')
        || this.component === 'modelViewList');
      }
   
  }

  checkisRecordLockByComponent(component:any, selected:any){
      if ((component == "Model_Property" && this.permissions == "Model Property") || component == "Level_Qualifiers" || component == "Validation" || component == "modelViewList" || component == 'User_Classification_Edit' || component == 'PicklistPropertysrv' || component == 'Boilerplate_Text_List' || component == 'Text_Qualifier' || component == 'Boilerplate_Text_Value' || component == 'acquiredCompany' || component == 'companyContactInformation' || component == 'personsCompany' || component == 'Location' || component == "PersonNameEditCreateNew" || component == "PersonEditCreate" || this.component === 'User_Management' || component == "PersonCompany" || component == "PersonEditCreatePersonClassification" || component == 'fileDesign' || component === 'extensionTable' || component == 'Automation_Setup' || (component == 'Automation_Design' && this.permissions != 'Automation Design') || component == 'Related_Filter' || component == 'Analytics_Query' || component == 'Analytics_Additional_Data' || component == 'Analytics_Repository' || component == 'FileVersion' || this.component === 'propertyAutomaitonDesign' || component == 'File_Record' || component == 'formDesign' || component == 'Render_Engine' || component == 'renderEngine' || component == 'Render_Engine_srv' || component == 'TemplateDeign') {
      return this.mainlayout.checkisRecordLock(component, this.mainRecordId);
    } else {
      return this.mainlayout.checkisRecordLock(component, selected);
    }
  }

  checkStateCanBeChange(status: string):any{
    if (this.component === 'modelViewList' && (status == 'Archive' || status == 'Soft Deleted') ) {
        let locationEdit = false;
        for (let index = 0; index < this.selected.length; index++) {
          if (this.selected[index].isLinkUsed) {
            locationEdit = true;
          }
        }
       return locationEdit;
    }
  }

}
