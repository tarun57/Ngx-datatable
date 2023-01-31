import { Directive, TemplateRef,Input,OnInit } from '@angular/core';

@Directive({ selector: '[ngx-datatable-cell-template]' })
export class DataTableColumnCellDirective implements OnInit {

  @Input() rowClass:any



  constructor(public template: TemplateRef<any>) {
   }

   ngOnInit(){
   }
}
