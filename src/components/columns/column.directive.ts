import { Directive, TemplateRef, ContentChild, Input } from '@angular/core';
import { DataTableColumnHeaderDirective } from './column-header.directive';
import { DataTableColumnCellDirective } from './column-cell.directive';
import { TableColumnProp } from '../../types';

@Directive({ selector: 'ngx-datatable-column' })
export class DataTableColumnDirective {

  @Input() name: string;
  @Input() prop: TableColumnProp;
  @Input() frozenLeft: any;
  @Input() frozenRight: any;
  @Input() flexGrow: number;
  @Input() resizeable: boolean;
  @Input() comparator: any;
  @Input() pipe: any;
  @Input() sortable: boolean;
  @Input() draggable: boolean;
  @Input() canAutoResize: boolean;
  @Input() minWidth: number;
  @Input() width: number;
  @Input() maxWidth: number;
  @Input() checkboxable: boolean;
  @Input() headerCheckboxable: boolean;
  @Input() headerClass: string | ((data: any) => string|any);
  @Input() cellClass: string | ((data: any) => string|any); 
  @Input() customSortType: string;
  
  @ContentChild(DataTableColumnCellDirective, { read: TemplateRef,static:true }) 
  cellTemplate: TemplateRef<any>;

  
  @ContentChild(DataTableColumnHeaderDirective, { read: TemplateRef,static:true }) 
  headerTemplate: TemplateRef<any>;

}
